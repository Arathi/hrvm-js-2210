class Memory {
    constructor(width = 1, height = 1, variables = {}, values = []) {
        this.width = 1
        this.height = 1
        this.size = width * height
        this.init(variables, values)
    }
    
    init(variables = {}, values = []) {
        this.variableToIndex = variables
        
        this.indexToVariable = []
        if (variables != undefined) {
            for (let variable in variables) {
                let index = variables[variable]
                this.indexToVariable[index] = variable
            }
        }
        
        this.values = []
        for (let index = 0; index < this.size; index++) {
            this.values[index] = values[index]
        }
    }
    
    registerVariable(name, index) {
        this.variableToIndex[name] = index
        this.indexToVariable[index] = name
    }
    
    get(index) {
        if (typeof(index) == 'string' && this.variableToIndex.hasOwnProperty(index)) {
            index = parseInt(this.variableToIndex[index])
        }
        
        if (typeof(index) != 'number' || index < 0 || index >= this.size) {
            console.error(`无效的下标${index}`)
            return undefined
        }
        
        return this.values[index]
    }
    
    set(index, value) {
        if (typeof(index) == 'string' && this.variableToIndex.hasOwnProperty(index)) {
            index = parseInt(this.variableToIndex[index])
        }
        
        if (typeof(index) != 'number' || index < 0 || index >= this.size) {
            console.error(`无效的下标${index}`)
            return undefined
        }
        
        this.values[index] = value
    }
}

class Instruction {
    constructor(opercode, operand = undefined, labels = undefined) {
        this.labels = labels
        this.opercode = opercode
        this.operand = operand
    }
    
    addLavel(label) {
        if (this.labels == undefined) {
            this.labels = []
        }
        this.labels.push(label)
    }
}

class HumanResourceVirtualMachine {
    constructor() {
        this.programs = []
    }
    
    compile(sources) {
        this.programs = []
    }
}
