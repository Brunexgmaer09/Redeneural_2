/**
 * Implementação de Algoritmo Genético para evolução de redes neurais em JavaScript
 * Convertido diretamente do código C++
 */

class AlgoritmoGenetico {
    // Constantes do algoritmo genético
    static TAXA_MUTACAO_PADRAO = 0.3;
    static INTENSIDADE_MUTACAO_PADRAO = 0.3;
    static TAXA_CROSSOVER_PADRAO = 0.7;
    static NUM_ELITISMO = 20;
    static TAXA_NOVOS_INDIVIDUOS = 0.1;
    static TAXA_MUTACAO_SUAVE = 0.1;
    static INTENSIDADE_MUTACAO_SUAVE = 0.1;
    
    constructor(tamPopulacao, numCamadasEscondidas, numEntradas, numNeuroniosEscondidos, numSaidas) {
        this.populacao = [];
        this.tamanhoPopulacao = tamPopulacao;
        this.numCamadasEscondidas = numCamadasEscondidas;
        this.numEntradas = numEntradas;
        this.numNeuroniosEscondidos = numNeuroniosEscondidos;
        this.numSaidas = numSaidas;
        this.geracoesSemMelhoria = 0;
        this.melhorFitnessAnterior = 0.0;
        this.TAXA_MUTACAO = AlgoritmoGenetico.TAXA_MUTACAO_PADRAO;
        this.INTENSIDADE_MUTACAO = AlgoritmoGenetico.INTENSIDADE_MUTACAO_PADRAO;
        this.TAXA_CROSSOVER = AlgoritmoGenetico.TAXA_CROSSOVER_PADRAO;
    }
    
    /**
     * Estrutura que representa um indivíduo na população
     */
    criarIndividuo() {
        return {
            rede: new RedeNeural(this.numCamadasEscondidas, this.numEntradas, 
                               this.numNeuroniosEscondidos, this.numSaidas),
            fitness: 0.0,
            novidade: 0.0
        };
    }
    
    inicializarPopulacao() {
        this.populacao = [];
        for (let i = 0; i < this.tamanhoPopulacao; i++) {
            this.populacao.push(this.criarIndividuo());
        }
    }
    
    avaliarPopulacao(funcaoAvaliacao) {
        for (let individuo of this.populacao) {
            individuo.fitness = funcaoAvaliacao(individuo.rede);
        }
        this.calcularNovidade();
    }
    
    evoluir() {
        // Verifica se houve melhoria
        const melhorFitnessAtual = this.getMelhorFitness();
        if (melhorFitnessAtual <= this.melhorFitnessAnterior) {
            this.geracoesSemMelhoria++;
        } else {
            this.geracoesSemMelhoria = 0;
            this.melhorFitnessAnterior = melhorFitnessAtual;
        }
        
        // Ajusta parâmetros baseado no progresso
        this.ajustarParametros();
        
        const novaPopulacao = [];
        
        // Elitismo - mantém os melhores indivíduos e cria cópias mutadas deles
        const elite = this.selecionarElite();
        
        // Adiciona os elitistas originais
        novaPopulacao.push(...elite);
        
        // Cria cópias mutadas dos elitistas
        for (const elitista of elite) {
            const genes = elitista.rede.copiarCamadasParaVetor();
            
            // Aplica uma mutação mais suave nas cópias dos elitistas
            this.mutacaoSuave(genes);
            
            const copiaElitista = this.criarIndividuo();
            copiaElitista.rede.copiarVetorParaCamadas(genes);
            novaPopulacao.push(copiaElitista);
        }
        
        // Adiciona alguns indivíduos completamente novos para manter diversidade
        const numNovos = Math.floor(this.tamanhoPopulacao * AlgoritmoGenetico.TAXA_NOVOS_INDIVIDUOS);
        for (let i = 0; i < numNovos; i++) {
            novaPopulacao.push(this.criarIndividuo());
        }
        
        // Preenche o resto da população com crossover e mutação
        while (novaPopulacao.length < this.tamanhoPopulacao) {
            const pai1 = this.selecaoTorneio();
            const pai2 = this.selecaoTorneio();
            
            const genes1 = pai1.rede.copiarCamadasParaVetor();
            const genes2 = pai2.rede.copiarCamadasParaVetor();
            
            let filho1 = [...genes1];
            let filho2 = [...genes2];
            
            // Crossover
            if (Math.random() < this.TAXA_CROSSOVER) {
                [filho1, filho2] = this.crossover(genes1, genes2);
            }
            
            // Mutação adaptativa
            this.mutacao(filho1);
            this.mutacao(filho2);
            
            // Cria novos indivíduos
            const novoInd1 = this.criarIndividuo();
            const novoInd2 = this.criarIndividuo();
            
            novoInd1.rede.copiarVetorParaCamadas(filho1);
            novoInd2.rede.copiarVetorParaCamadas(filho2);
            
            novaPopulacao.push(novoInd1);
            if (novaPopulacao.length < this.tamanhoPopulacao) {
                novaPopulacao.push(novoInd2);
            }
        }
        
        this.populacao = novaPopulacao;
    }
    
    getMelhorFitness() {
        let melhor = -1e9;
        for (const ind of this.populacao) {
            melhor = Math.max(melhor, ind.fitness);
        }
        return melhor;
    }
    
    getMediaFitness() {
        let soma = 0;
        for (const ind of this.populacao) {
            soma += ind.fitness;
        }
        return soma / this.populacao.length;
    }
    
    ajustarParametros() {
        // Aumenta a taxa e intensidade de mutação se ficar estagnado
        if (this.geracoesSemMelhoria > 5) {
            this.TAXA_MUTACAO = Math.min(0.8, this.TAXA_MUTACAO * 1.5);
            this.INTENSIDADE_MUTACAO = Math.min(0.8, this.INTENSIDADE_MUTACAO * 1.5);
        } else {
            this.TAXA_MUTACAO = AlgoritmoGenetico.TAXA_MUTACAO_PADRAO;
            this.INTENSIDADE_MUTACAO = AlgoritmoGenetico.INTENSIDADE_MUTACAO_PADRAO;
        }
    }
    
    calcularNovidade() {
        for (const ind1 of this.populacao) {
            let somaDistancias = 0;
            const genes1 = ind1.rede.copiarCamadasParaVetor();
            
            for (const ind2 of this.populacao) {
                if (ind1 !== ind2) {
                    const genes2 = ind2.rede.copiarCamadasParaVetor();
                    
                    // Calcula distância euclidiana entre os genes
                    let distancia = 0;
                    for (let i = 0; i < genes1.length; i++) {
                        const diff = genes1[i] - genes2[i];
                        distancia += diff * diff;
                    }
                    somaDistancias += Math.sqrt(distancia);
                }
            }
            ind1.novidade = somaDistancias / (this.populacao.length - 1);
        }
    }
    
    selecionarElite() {
        const elite = [];
        const candidatos = [...this.populacao];
        
        // Ordena por fitness e novidade
        candidatos.sort((a, b) => {
            const scoreA = a.fitness * 0.7 + a.novidade * 0.3;
            const scoreB = b.fitness * 0.7 + b.novidade * 0.3;
            return scoreB - scoreA;
        });
        
        // Seleciona os melhores
        for (let i = 0; i < AlgoritmoGenetico.NUM_ELITISMO && i < candidatos.length; i++) {
            elite.push({
                rede: new RedeNeural(this.numCamadasEscondidas, this.numEntradas, 
                                   this.numNeuroniosEscondidos, this.numSaidas),
                fitness: candidatos[i].fitness,
                novidade: candidatos[i].novidade
            });
            
            // Copia os pesos da rede original
            const genes = candidatos[i].rede.copiarCamadasParaVetor();
            elite[elite.length - 1].rede.copiarVetorParaCamadas(genes);
        }
        
        return elite;
    }
    
    selecaoTorneio() {
        const TAMANHO_TORNEIO = 5;
        const torneio = [];
        
        // Seleciona indivíduos aleatórios para o torneio
        for (let i = 0; i < TAMANHO_TORNEIO; i++) {
            const idx = Math.floor(Math.random() * this.populacao.length);
            torneio.push(this.populacao[idx]);
        }
        
        // Encontra o melhor do torneio considerando fitness e novidade
        let melhor = torneio[0];
        let melhorScore = melhor.fitness * 0.7 + melhor.novidade * 0.3;
        
        for (let i = 1; i < torneio.length; i++) {
            const score = torneio[i].fitness * 0.7 + torneio[i].novidade * 0.3;
            if (score > melhorScore) {
                melhor = torneio[i];
                melhorScore = score;
            }
        }
        
        return melhor;
    }
    
    // Gerador de números com distribuição normal (Box-Muller)
    static normalRandom(mean = 0, stdDev = 1) {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        return z * stdDev + mean;
    }
    
    mutacao(pesos) {
        for (let i = 0; i < pesos.length; i++) {
            if (Math.random() < this.TAXA_MUTACAO) {
                pesos[i] += AlgoritmoGenetico.normalRandom(0, this.INTENSIDADE_MUTACAO);
            }
        }
    }
    
    mutacaoSuave(pesos) {
        for (let i = 0; i < pesos.length; i++) {
            if (Math.random() < AlgoritmoGenetico.TAXA_MUTACAO_SUAVE) {
                pesos[i] += AlgoritmoGenetico.normalRandom(0, AlgoritmoGenetico.INTENSIDADE_MUTACAO_SUAVE);
            }
        }
    }
    
    crossover(pesos1, pesos2) {
        const filho1 = [...pesos1];
        const filho2 = [...pesos2];
        
        for (let i = 0; i < pesos1.length; i++) {
            if (Math.random() < 0.5) {
                filho1[i] = pesos2[i];
                filho2[i] = pesos1[i];
            }
        }
        
        return [filho1, filho2];
    }
    
    // Getters e setters
    getIndividuo(index) { return this.populacao[index]; }
    setIndividuoFitness(index, fitness) { this.populacao[index].fitness = fitness; }
    getTamanhoPopulacao() { return this.populacao.length; }
    getTaxaMutacao() { return this.TAXA_MUTACAO; }
    getIntensidadeMutacao() { return this.INTENSIDADE_MUTACAO; }
    getTaxaCrossover() { return this.TAXA_CROSSOVER; }
    getGeracoesSemMelhoria() { return this.geracoesSemMelhoria; }
}

// Para uso em Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AlgoritmoGenetico };
}