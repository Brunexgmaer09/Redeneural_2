/**
 * Variáveis e constantes globais para a rede neural
 * Convertido do C++
 */

class Variaveis {
    // Constantes para a rede neural
    static POPULACAO_MAX = 1000;
    static POPULACAO_TAMANHO = 100;
    
    // Parâmetros da rede neural padrão (para jogos como Flappy Bird)
    static BIRD_BRAIN_QTD_LAYERS = 1;    // Quantidade de camadas escondidas
    static BIRD_BRAIN_QTD_INPUT = 5;     // Quantidade de neurônios na entrada
    static BIRD_BRAIN_QTD_HIDE = 4;      // Quantidade de neurônios na camada escondida
    static BIRD_BRAIN_QTD_OUTPUT = 2;    // Quantidade de neurônios na saída

    // Variáveis para controle de gerações
    static GeracaoCompleta = 0;
    static BestFitnessPopulacao = [];
    static MediaFitnessPopulacao = [];
    static MediaFitnessFilhos = [];
    
    // Variável para armazenar a melhor rede
    static MelhorRede = null;
    
    // Métodos para manipular as variáveis
    static resetarEstatisticas() {
        this.GeracaoCompleta = 0;
        this.BestFitnessPopulacao = [];
        this.MediaFitnessPopulacao = [];
        this.MediaFitnessFilhos = [];
        this.MelhorRede = null;
    }
    
    static adicionarEstatistica(melhorFitness, mediaFitness, mediaFilhos = 0) {
        this.BestFitnessPopulacao.push(melhorFitness);
        this.MediaFitnessPopulacao.push(mediaFitness);
        this.MediaFitnessFilhos.push(mediaFilhos);
        this.GeracaoCompleta++;
    }
    
    static obterEstatisticas() {
        return {
            geracao: this.GeracaoCompleta,
            melhorFitness: this.BestFitnessPopulacao,
            mediaFitness: this.MediaFitnessPopulacao,
            mediaFilhos: this.MediaFitnessFilhos,
            melhorRede: this.MelhorRede
        };
    }
    
    static definirMelhorRede(rede) {
        // Cria uma cópia da rede para evitar referências
        this.MelhorRede = {
            dados: rede.salvarRede('melhor_rede'),
            fitness: 0 // Deve ser definido externamente
        };
    }
    
    static carregarMelhorRede() {
        if (this.MelhorRede && this.MelhorRede.dados) {
            return RedeNeural.carregarRede(this.MelhorRede.dados);
        }
        return null;
    }
}

// Para uso em Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Variaveis };
}