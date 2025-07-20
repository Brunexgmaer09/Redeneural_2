#pragma once
#include <vector>
#include <cmath>
#include <memory>
#include <string>

class Neuronio {
private:
    std::vector<double> pesos;
    double erro;
    double saida;

public:
    Neuronio(int quantidadeLigacoes);
    
    double getSaida() const { return saida; }
    void setSaida(double valor) { saida = valor; }
    
    double getErro() const { return erro; }
    void setErro(double valor) { erro = valor; }
    
    double getPeso(int index) const { return pesos[index]; }
    void setPeso(int index, double valor) { pesos[index] = valor; }
    
    int getQuantidadeLigacoes() const { return pesos.size(); }
    std::vector<double>& getPesos() { return pesos; }
    const std::vector<double>& getPesos() const { return pesos; }
};

class Camada {
private:
    std::vector<Neuronio> neuronios;

public:
    Camada(int quantidadeNeuronios, int quantidadeLigacoes);
    
    Neuronio& getNeuronio(int index) { return neuronios[index]; }
    const Neuronio& getNeuronio(int index) const { return neuronios[index]; }
    
    int getQuantidadeNeuronios() const { return neuronios.size(); }
};

class RedeNeural {
private:
    static constexpr double TAXA_APRENDIZADO = 0.1;
    static constexpr double TAXA_PESO_INICIAL = 1.0;
    static constexpr int BIAS = 1;

    Camada camadaEntrada;
    std::vector<Camada> camadasEscondidas;
    Camada camadaSaida;

    static double relu(double x);
    static double sigmoid(double x);

public:
    RedeNeural(int quantidadeEscondidas, 
               int qtdNeuroniosEntrada, 
               int qtdNeuroniosEscondida, 
               int qtdNeuroniosSaida);

    void calcularSaida();
    void copiarParaEntrada(const std::vector<double>& vetorEntrada);
    void copiarDaSaida(std::vector<double>& vetorSaida);
    
    void treinar(const std::vector<double>& entrada, const std::vector<double>& saidaEsperada);
    void calcularErro(const std::vector<double>& saidaEsperada);
    void backpropagation();
    double calcularErroQuadratico(const std::vector<double>& saidaEsperada);
    
    static double derivadaTanh(double x);
    static double derivadaSigmoid(double x);
    
    int getQuantidadePesos() const;
    void copiarVetorParaCamadas(const std::vector<double>& vetor);
    void copiarCamadasParaVetor(std::vector<double>& vetor) const;

    const std::vector<Camada>& getCamadasEscondidas() const { return camadasEscondidas; }
    const Camada& getCamadaSaida() const { return camadaSaida; }
    const Camada& getCamadaEntrada() const { return camadaEntrada; }

    static RedeNeural carregarRede(const std::string& nomeArquivo);
    void salvarRede(const std::string& nomeArquivo) const;
}; 