#pragma once
#include <SFML/Graphics.hpp>

// Função de ativação sigmoide (usando tanh)
float sigm(const float x);

// Função para criar uma linha retangular entre dois pontos
sf::RectangleShape getLine(const sf::Vector2f& point_1, 
                          const sf::Vector2f& point_2, 
                          const float width, 
                          const sf::Color& color); 