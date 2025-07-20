/**
 * Implementação de Rede Neural em JavaScript
 * Convertida diretamente do código C++
 */

class Neuronio {
    constructor(quantidadeLigacoes) {
        this.pesos = [];
        this.erro = 0;
        this.saida = 0;
        
        // Inicialização Xavier
        this.pesos = new Array(quantidadeLigacoes);
        for (let i = 0; i < quantidadeLigacoes; i++) {
            const valor = (Math.random() * 2 - 1) * Math.sqrt(2.0 / quantidadeLigacoes);
            this.pesos[i] = valor;
        }
    }
    
    getSaida() { return this.saida; }
    setSaida(valor) { this.saida = valor; }
    
    getErro() { return this.erro; }
    setErro(valor) { this.erro = valor; }
    
    getPeso(index) { return this.pesos[index]; }
    setPeso(index, valor) { this.pesos[index] = valor; }
    
    getQuantidadeLigacoes() { return this.pesos.length; }
    getPesos() { return this.pesos; }
}

class Camada {
    constructor(quantidadeNeuronios, quantidadeLigacoes) {
        this.neuronios = [];
        for (let i = 0; i < quantidadeNeuronios; i++) {
            this.neuronios.push(new Neuronio(quantidadeLigacoes));
        }
    }
    
    getNeuronio(index) { return this.neuronios[index]; }
    getQuantidadeNeuronios() { return this.neuronios.length; }
}

class RedeNeural {
    static TAXA_APRENDIZADO = 0.1;
    static TAXA_PESO_INICIAL = 1.0;
    static BIAS = 1;
    
    constructor(quantidadeEscondidas, qtdNeuroniosEntrada, qtdNeuroniosEscondida, qtdNeuroniosSaida) {
        if (quantidadeEscondidas <= 0 || qtdNeuroniosEntrada <= 0 || 
            qtdNeuroniosEscondida <= 0 || qtdNeuroniosSaida <= 0) {
            throw new Error("Quantidade de neurônios deve ser positiva");
        }
        
        this.camadaEntrada = new Camada(qtdNeuroniosEntrada, 0);
        this.camadaSaida = new Camada(qtdNeuroniosSaida, qtdNeuroniosEscondida);
        this.camadasEscondidas = [];
        
        // Inicializa camadas escondidas
        for (let i = 0; i < quantidadeEscondidas; i++) {
            const entradasCamada = (i === 0) ? qtdNeuroniosEntrada : qtdNeuroniosEscondida;
            this.camadasEscondidas.push(new Camada(qtdNeuroniosEscondida, entradasCamada));
        }
    }
    
    calcularSaida() {
        if (this.camadasEscondidas.length === 0) {
            throw new Error("Rede neural deve ter pelo menos uma camada escondida");
        }
        
        // Propaga valores da entrada para primeira camada escondida
        for (let i = 0; i < this.camadasEscondidas[0].getQuantidadeNeuronios(); i++) {
            let soma = 0;
            for (let j = 0; j < this.camadaEntrada.getQuantidadeNeuronios(); j++) {
                soma += this.camadaEntrada.getNeuronio(j).getSaida() * 
                        this.camadasEscondidas[0].getNeuronio(i).getPeso(j);
            }
            this.camadasEscondidas[0].getNeuronio(i).setSaida(Math.tanh(soma));
        }
        
        // Propaga entre camadas escondidas
        for (let c = 1; c < this.camadasEscondidas.length; c++) {
            for (let i = 0; i < this.camadasEscondidas[c].getQuantidadeNeuronios(); i++) {
                let soma = 0;
                for (let j = 0; j < this.camadasEscondidas[c-1].getQuantidadeNeuronios(); j++) {
                    soma += this.camadasEscondidas[c-1].getNeuronio(j).getSaida() * 
                            this.camadasEscondidas[c].getNeuronio(i).getPeso(j);
                }
                this.camadasEscondidas[c].getNeuronio(i).setSaida(Math.tanh(soma));
            }
        }
        
        // Propaga para camada de saída
        for (let i = 0; i < this.camadaSaida.getQuantidadeNeuronios(); i++) {
            let soma = 0;
            for (let j = 0; j < this.camadasEscondidas[this.camadasEscondidas.length - 1].getQuantidadeNeuronios(); j++) {
                soma += this.camadasEscondidas[this.camadasEscondidas.length - 1].getNeuronio(j).getSaida() * 
                        this.camadaSaida.getNeuronio(i).getPeso(j);
            }
            this.camadaSaida.getNeuronio(i).setSaida(RedeNeural.sigmoid(soma));
        }
    }
    
    copiarParaEntrada(vetorEntrada) {
        for (let i = 0; i < vetorEntrada.length && i < this.camadaEntrada.getQuantidadeNeuronios(); i++) {
            this.camadaEntrada.getNeuronio(i).setSaida(vetorEntrada[i]);
        }
    }
    
    copiarDaSaida() {
        const vetorSaida = [];
        for (let i = 0; i < this.camadaSaida.getQuantidadeNeuronios(); i++) {
            vetorSaida.push(this.camadaSaida.getNeuronio(i).getSaida());
        }
        return vetorSaida;
    }
    
    static sigmoid(x) {
        return 1.0 / (1.0 + Math.exp(-x));
    }
    
    static relu(x) {
        return x > 0 ? x : x * 0.01; // Leaky ReLU
    }
    
    getQuantidadePesos() {
        let total = 0;
        
        // Pesos da primeira camada escondida
        total += this.camadasEscondidas[0].getQuantidadeNeuronios() * 
                 this.camadaEntrada.getQuantidadeNeuronios();
        
        // Pesos entre camadas escondidas
        for (let i = 1; i < this.camadasEscondidas.length; i++) {
            total += this.camadasEscondidas[i].getQuantidadeNeuronios() * 
                     this.camadasEscondidas[i-1].getQuantidadeNeuronios();
        }
        
        // Pesos da camada de saída
        total += this.camadaSaida.getQuantidadeNeuronios() * 
                 this.camadasEscondidas[this.camadasEscondidas.length - 1].getQuantidadeNeuronios();
        
        return total;
    }
    
    copiarVetorParaCamadas(vetor) {
        let pos = 0;
        
        // Copia para primeira camada escondida
        for (let i = 0; i < this.camadasEscondidas[0].getQuantidadeNeuronios(); i++) {
            for (let j = 0; j < this.camadaEntrada.getQuantidadeNeuronios(); j++) {
                if (pos < vetor.length) {
                    this.camadasEscondidas[0].getNeuronio(i).setPeso(j, vetor[pos++]);
                }
            }
        }
        
        // Copia entre camadas escondidas
        for (let c = 1; c < this.camadasEscondidas.length; c++) {
            for (let i = 0; i < this.camadasEscondidas[c].getQuantidadeNeuronios(); i++) {
                for (let j = 0; j < this.camadasEscondidas[c-1].getQuantidadeNeuronios(); j++) {
                    if (pos < vetor.length) {
                        this.camadasEscondidas[c].getNeuronio(i).setPeso(j, vetor[pos++]);
                    }
                }
            }
        }
        
        // Copia para camada de saída
        for (let i = 0; i < this.camadaSaida.getQuantidadeNeuronios(); i++) {
            for (let j = 0; j < this.camadasEscondidas[this.camadasEscondidas.length - 1].getQuantidadeNeuronios(); j++) {
                if (pos < vetor.length) {
                    this.camadaSaida.getNeuronio(i).setPeso(j, vetor[pos++]);
                }
            }
        }
    }
    
    copiarCamadasParaVetor() {
        const vetor = [];
        
        // Copia da primeira camada escondida
        for (let i = 0; i < this.camadasEscondidas[0].getQuantidadeNeuronios(); i++) {
            for (let j = 0; j < this.camadaEntrada.getQuantidadeNeuronios(); j++) {
                vetor.push(this.camadasEscondidas[0].getNeuronio(i).getPeso(j));
            }
        }
        
        // Copia entre camadas escondidas
        for (let c = 1; c < this.camadasEscondidas.length; c++) {
            for (let i = 0; i < this.camadasEscondidas[c].getQuantidadeNeuronios(); i++) {
                for (let j = 0; j < this.camadasEscondidas[c-1].getQuantidadeNeuronios(); j++) {
                    vetor.push(this.camadasEscondidas[c].getNeuronio(i).getPeso(j));
                }
            }
        }
        
        // Copia da camada de saída
        for (let i = 0; i < this.camadaSaida.getQuantidadeNeuronios(); i++) {
            for (let j = 0; j < this.camadasEscondidas[this.camadasEscondidas.length - 1].getQuantidadeNeuronios(); j++) {
                vetor.push(this.camadaSaida.getNeuronio(i).getPeso(j));
            }
        }
        
        return vetor;
    }
    
    // Métodos de salvamento/carregamento usando localStorage ou JSON
    salvarRede(nome) {
        const dados = {
            quantidadeEscondidas: this.camadasEscondidas.length,
            qtdNeuroniosEntrada: this.camadaEntrada.getQuantidadeNeuronios(),
            qtdNeuroniosEscondida: this.camadasEscondidas[0].getQuantidadeNeuronios(),
            qtdNeuroniosSaida: this.camadaSaida.getQuantidadeNeuronios(),
            pesos: this.copiarCamadasParaVetor()
        };
        
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(nome, JSON.stringify(dados));
        }
        return dados;
    }
    
    static carregarRede(nome) {
        let dados;
        
        if (typeof nome === 'object') {
            dados = nome; // Se passado diretamente como objeto
        } else if (typeof localStorage !== 'undefined') {
            dados = JSON.parse(localStorage.getItem(nome));
        }
        
        if (!dados) {
            throw new Error("Dados da rede não encontrados");
        }
        
        const rede = new RedeNeural(
            dados.quantidadeEscondidas,
            dados.qtdNeuroniosEntrada,
            dados.qtdNeuroniosEscondida,
            dados.qtdNeuroniosSaida
        );
        
        rede.copiarVetorParaCamadas(dados.pesos);
        return rede;
    }
    
    treinar(entrada, saidaEsperada) {
        this.copiarParaEntrada(entrada);
        this.calcularSaida();
        this.calcularErro(saidaEsperada);
        this.backpropagation();
    }
    
    calcularErro(saidaEsperada) {
        if (saidaEsperada.length !== this.camadaSaida.getQuantidadeNeuronios()) {
            throw new Error("Tamanho da saída esperada não coincide com saída da rede");
        }
        
        // Calcular erro na camada de saída
        for (let i = 0; i < this.camadaSaida.getQuantidadeNeuronios(); i++) {
            const saida = this.camadaSaida.getNeuronio(i).getSaida();
            const erro = saidaEsperada[i] - saida;
            this.camadaSaida.getNeuronio(i).setErro(erro * RedeNeural.derivadaSigmoid(saida));
        }
    }
    
    backpropagation() {
        // Propagação do erro da camada de saída para a última camada escondida
        for (let i = 0; i < this.camadasEscondidas[this.camadasEscondidas.length - 1].getQuantidadeNeuronios(); i++) {
            let erro = 0;
            for (let j = 0; j < this.camadaSaida.getQuantidadeNeuronios(); j++) {
                erro += this.camadaSaida.getNeuronio(j).getErro() * 
                        this.camadaSaida.getNeuronio(j).getPeso(i);
            }
            const saida = this.camadasEscondidas[this.camadasEscondidas.length - 1].getNeuronio(i).getSaida();
            this.camadasEscondidas[this.camadasEscondidas.length - 1].getNeuronio(i).setErro(erro * RedeNeural.derivadaTanh(saida));
        }
        
        // Propagação do erro entre camadas escondidas
        for (let c = this.camadasEscondidas.length - 2; c >= 0; c--) {
            for (let i = 0; i < this.camadasEscondidas[c].getQuantidadeNeuronios(); i++) {
                let erro = 0;
                for (let j = 0; j < this.camadasEscondidas[c+1].getQuantidadeNeuronios(); j++) {
                    erro += this.camadasEscondidas[c+1].getNeuronio(j).getErro() * 
                            this.camadasEscondidas[c+1].getNeuronio(j).getPeso(i);
                }
                const saida = this.camadasEscondidas[c].getNeuronio(i).getSaida();
                this.camadasEscondidas[c].getNeuronio(i).setErro(erro * RedeNeural.derivadaTanh(saida));
            }
        }
        
        // Atualização dos pesos da camada de saída
        for (let i = 0; i < this.camadaSaida.getQuantidadeNeuronios(); i++) {
            for (let j = 0; j < this.camadasEscondidas[this.camadasEscondidas.length - 1].getQuantidadeNeuronios(); j++) {
                const deltaPeso = RedeNeural.TAXA_APRENDIZADO * 
                                this.camadaSaida.getNeuronio(i).getErro() * 
                                this.camadasEscondidas[this.camadasEscondidas.length - 1].getNeuronio(j).getSaida();
                const novoPeso = this.camadaSaida.getNeuronio(i).getPeso(j) + deltaPeso;
                this.camadaSaida.getNeuronio(i).setPeso(j, novoPeso);
            }
        }
        
        // Atualização dos pesos entre camadas escondidas
        for (let c = 1; c < this.camadasEscondidas.length; c++) {
            for (let i = 0; i < this.camadasEscondidas[c].getQuantidadeNeuronios(); i++) {
                for (let j = 0; j < this.camadasEscondidas[c-1].getQuantidadeNeuronios(); j++) {
                    const deltaPeso = RedeNeural.TAXA_APRENDIZADO * 
                                    this.camadasEscondidas[c].getNeuronio(i).getErro() * 
                                    this.camadasEscondidas[c-1].getNeuronio(j).getSaida();
                    const novoPeso = this.camadasEscondidas[c].getNeuronio(i).getPeso(j) + deltaPeso;
                    this.camadasEscondidas[c].getNeuronio(i).setPeso(j, novoPeso);
                }
            }
        }
        
        // Atualização dos pesos da primeira camada escondida
        for (let i = 0; i < this.camadasEscondidas[0].getQuantidadeNeuronios(); i++) {
            for (let j = 0; j < this.camadaEntrada.getQuantidadeNeuronios(); j++) {
                const deltaPeso = RedeNeural.TAXA_APRENDIZADO * 
                                this.camadasEscondidas[0].getNeuronio(i).getErro() * 
                                this.camadaEntrada.getNeuronio(j).getSaida();
                const novoPeso = this.camadasEscondidas[0].getNeuronio(i).getPeso(j) + deltaPeso;
                this.camadasEscondidas[0].getNeuronio(i).setPeso(j, novoPeso);
            }
        }
    }
    
    calcularErroQuadratico(saidaEsperada) {
        if (saidaEsperada.length !== this.camadaSaida.getQuantidadeNeuronios()) {
            throw new Error("Tamanho da saída esperada não coincide com saída da rede");
        }
        
        let erroTotal = 0;
        for (let i = 0; i < this.camadaSaida.getQuantidadeNeuronios(); i++) {
            const diferenca = saidaEsperada[i] - this.camadaSaida.getNeuronio(i).getSaida();
            erroTotal += diferenca * diferenca;
        }
        return erroTotal / 2.0;
    }
    
    static derivadaTanh(x) {
        return 1.0 - (x * x);
    }
    
    static derivadaSigmoid(x) {
        return x * (1.0 - x);
    }
    
    getCamadasEscondidas() { return this.camadasEscondidas; }
    getCamadaSaida() { return this.camadaSaida; }
    getCamadaEntrada() { return this.camadaEntrada; }
}

// Para uso em Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RedeNeural, Camada, Neuronio };
}