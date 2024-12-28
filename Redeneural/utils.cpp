#include "utils.hpp"
#include <cmath>

float sigm(const float x) {
    return std::tanh(x);
}

sf::RectangleShape getLine(const sf::Vector2f& point_1, const sf::Vector2f& point_2, const float width, const sf::Color& color) {
    const sf::Vector2f direction = point_2 - point_1;
    const float length = std::sqrt(direction.x * direction.x + direction.y * direction.y);
    
    sf::RectangleShape line(sf::Vector2f(length, width));
    line.setPosition(point_1);
    line.setFillColor(color);
    
    float angle = std::atan2(direction.y, direction.x) * 180.0f / 3.14159265f;
    line.setRotation(angle);
    
    // Ajusta a origem para que a linha fique centralizada em sua espessura
    line.setOrigin(0.0f, width / 2.0f);
    
    return line;
} 