# Simulador Didáctico de Máquina de Turing

Aplicación web interactiva para enseñar el funcionamiento de una Máquina de Turing a estudiantes de 4.º y 5.º de secundaria.

## Características

- Simulación paso a paso y ejecución automática por bloques.
- Cinta visual con cabezal destacado.
- Estados de aceptación/rechazo y contador de pasos.
- Historial explicativo de cada transición.
- Ejemplos rápidos:
  - Sumar 1 en notación unaria.
  - Verificar si la cantidad de `1` es par.

## Uso

1. Abre `index.html` en tu navegador.
2. Elige un ejemplo rápido o define tu propia máquina.
3. Presiona **Cargar máquina**.
4. Usa **Paso a paso** o **Ejecutar (20 pasos)** para observar el comportamiento.

## Formato de transiciones

```text
estado,leer -> escribir,movimiento,estadoSiguiente
```

Donde `movimiento` puede ser:

- `L`: izquierda
- `R`: derecha
- `S`: sin movimiento
