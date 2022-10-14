const STATUS_PENDING = 0
const STATUS_RUNNING = 1
const STATUS_PAUSED = 2
const STATUS_STOPPED = 3

const options = {
    data() {
        return {
            acc: undefined,
            pc: 0,
            status: STATUS_PENDING,
            input: [3, 2, -7, -2, 1, 1, -9, 2],
            memory: new Memory(3, 1, {}, []),
            sources: `
.set first 0
.set second 1
start:
    JMP input
output:
    PHA
input:
    PLA
    STA first
    PLA
    STA second
    SUB first
    BMI getFirst
    LDA second
    JMP output
getFirst:
    LDA first
    JMP output
`.trim(),
            labels: {},
            instructions: [],
            output: [],
            counter: 0,
            left: 2
        }
    },
    
    methods: {
        compile() {
            let setPattern = /^([_A-Za-z0-9]+)[ \t]+(\d+)$/
            let instPattern = /^([A-Za-z]{3})([ \t]+(\[)?([_0-9A-Za-z]+)(\])?)?$/
            let sourceList = this.sources.split('\n')
            let labels = []
            for (let line of sourceList) {
                let source = line.trim()
                let matcher = undefined
                
                // .set指令
                if (source.startsWith(".set ")) {
                    let kv = source.substr(5)
                    matcher = setPattern.exec(kv)
                    if (matcher != undefined) {
                        let name = matcher[1]
                        let value = matcher[2]
                        console.log(`定义变量 ${name} = ${value}`)
                        this.memory.registerVariable(name, value)
                        continue
                    }
                }
                
                // 标签
                if (source.endsWith(":")) {
                    label = source.substr(0, source.length - 1)
                    labels.push(label)
                    continue
                }
                
                // 常规指令
                matcher = instPattern.exec(source)
                if (matcher != undefined) {
                    let inst = new Instruction(matcher[1], matcher[4], labels)
                    this.instructions.push(inst)
                    labels = []
                    continue
                }
                
                console.error("编译错误：" + line)
                break
            }
            
            for (let i = 0; i < this.instructions.length; i++) {
                let inst = this.instructions[i]
                for (let label of inst.labels) {
                    this.labels[label] = i
                }
            }
            
            console.log(`编译完成`)
        },
        
        reset() {
            this.acc = undefined
            this.pc = 0
            this.counter = 0
            this.status = STATUS_PENDING
        },
        
        jump(address) {
            if (typeof(address) == 'string' && this.labels.hasOwnProperty(address)) {
                address = this.labels[address]
            }
            this.pc = address
            if (address < 0 || address >= this.instructions.length) {
                this.status = STATUS_STOPPED
            }
        },
        
        getInstructionAndStep() {
            if (this.status == STATUS_PENDING || this.status == STATUS_PAUSED) {
                this.status = STATUS_RUNNING
            }
            
            if (this.status != STATUS_RUNNING) {
                return
            }
            
            let inst = this.instructions[this.pc++]
            this.step(inst)
            if (this.status != STATUS_RUNNING) {
                return
            }
            this.counter++
        },
        
        step(inst) {
            let data = undefined
            let operand = ""
            if (inst.operand != undefined) {
                operand = inst.operand
            }
            console.log(`${inst.opercode} ${operand}`)
            switch (inst.opercode) {
                case "PLA":
                    data = this.input.shift()
                    if (data != undefined) {
                        this.acc = data
                    }
                    else {
                        this.status = STATUS_STOPPED
                    }
                    break
                case "PHA":
                    if (this.acc != undefined) {
                        this.output.push(this.acc)
                    }
                    break
                case "LDA":
                    this.acc = this.memory.get(inst.operand)
                    break
                case "STA":
                    if (this.acc != undefined) {
                        this.memory.set(inst.operand, this.acc)
                    }
                    break
                case "ADD":
                    data = this.memory.get(inst.operand)
                    this.acc += data
                    break
                case "SUB":
                    data = this.memory.get(inst.operand)
                    this.acc -= data
                    break
                case "INC":
                    data = this.memory.get(inst.operand)
                    this.acc = data + 1
                    break
                case "DEC":
                    data = this.memory.get(inst.operand)
                    this.acc = data - 1
                    break
                case "JMP":
                    this.jump(inst.operand)
                    break
                case "BEQ":
                    if (this.acc == 0) {
                        this.jump(inst.operand)
                    }
                    break
                case "BMI":
                    if (this.acc < 0) {
                        this.jump(inst.operand)
                    }
                    break
            }
        },
        
        run() {
            this.reset()
            do {
                this.getInstructionAndStep()
            }
            while (this.status == STATUS_RUNNING)
        }
    },
    
    mounted() {
        console.log("已加载")
        this.compile()
        console.log(`编译后指令数量：${this.instructions.length}`)
    }
};

var app = Vue.createApp(options)
app.use(ElementPlus)
app.mount('#app');
