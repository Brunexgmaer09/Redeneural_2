/**
 * Funções Auxiliares para Rede Neural em JavaScript
 * Convertido diretamente do código C++
 */

class FuncoesAuxiliares {
    // Gerador de números aleatórios
    static getRandomValue() {
        return Math.random() * 2 - 1; // Retorna valor entre -1.0 e 1.0
    }
    
    // Função para calcular o melhor fitness de um conjunto de resultados
    static calcularMelhorFitness(resultados) {
        if (resultados.length === 0) return 0.0;
        
        return Math.max(...resultados);
    }
    
    // Função para calcular a média do fitness
    static calcularMediaFitness(resultados) {
        if (resultados.length === 0) return 0.0;
        
        const soma = resultados.reduce((acc, val) => acc + val, 0);
        return soma / resultados.length;
    }
}

// Para uso em Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FuncoesAuxiliares };
}