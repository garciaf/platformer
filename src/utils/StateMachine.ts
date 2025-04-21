interface StateConfig {
    name?: string;
    onEnter?: () => void;
    onUpdate?: (dt: number) => void;
    onExit?: () => void;
}

export default class StateMachine {
    
    private context?: any;
    private states = new Map<string, StateConfig>();    
    private currentState?: StateConfig;
    private isSwithingState = false;
    private stateQueue: string[] = [];

    constructor(context?: any) {
        this.context = context;
    }

    addState(name: string, config?: StateConfig) {
        this.states.set(name, {
            name,
            onEnter: config?.onEnter?.bind(this.context),
            onUpdate: config?.onUpdate?.bind(this.context),
            onExit: config?.onExit?.bind(this.context)
        });
        
        return this;
    }

    isCurrentState(name: string) {
        return this.currentState?.name === name;
    }

    setState(name: string) {
        if (!this.states.has(name)) {
            throw new Error(`State ${name} does not exist`);
        }

        if (this.isSwithingState) {
            this.stateQueue.push(name);
            return;
        }

        if (this.currentState?.onExit) {
            this.currentState.onExit();
        }
        this.currentState = this.states.get(name);
        if (this.currentState?.onEnter) {
            this.currentState.onEnter();
        }
    }

    update(dt: number) {
        if (this.stateQueue.length > 0) {
            const nextState = this.stateQueue.shift();
            this.setState(nextState!);
        }
        if (this.currentState?.onUpdate) {
            this.currentState.onUpdate(dt);
        }
    }
}