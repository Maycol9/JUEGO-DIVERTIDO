# Una aventura para ti 💖

Un cuento jugable hecho con HTML, CSS y JavaScript: una princesa, un dinosaurio tímido y una carta al final. Ilustraciones originales dibujadas en Canvas, sin recursos gráficos remotos ni instalación para quien juega.

## Probar en tu computadora

Instala Node.js si aún no lo tienes. Abre una terminal en esta carpeta y ejecuta:

```sh
node serve.cjs
```

Abre **http://127.0.0.1:8080**. Detén el servidor con Ctrl+C. Es mejor usar HTTP que abrir `index.html` con doble clic, especialmente para YouTube. Este servidor es solo de desarrollo, no es un backend requerido por el juego.

## Subir a GitHub y activar Pages

1. Crea un repositorio público en GitHub, por ejemplo `una-aventura-para-ti`.
2. En **Add file → Upload files**, sube `index.html`, `style.css`, `game.js`, `.nojekyll` y este README directamente a la raíz, sin una carpeta contenedora. Guarda los cambios en la rama **main**. También puedes subir `serve.cjs` y `tests/`; no son necesarios para jugar.
3. Ve a **Settings → Pages → Build and deployment**.
4. En **Source**, elige **Deploy from a branch**. En **Branch**, selecciona **main** y **/ (root)**; pulsa **Save**.
5. Espera a que el despliegue termine. La sección Pages mostrará el enlace publicado; abre **Visit site** y copia ese enlace para compartirlo.

Un sitio de repositorio suele tener la forma `https://TU-USUARIO.github.io/una-aventura-para-ti/`. Es un ejemplo, no un enlace ya publicado. El proyecto no ha sido desplegado desde esta sesión. Las rutas del juego son relativas, compatibles con subcarpetas.

Referencia: [guía oficial de GitHub Pages](https://docs.github.com/en/pages/quickstart).

## Personalizar el regalo

Al principio de `game.js`, modifica `CONFIG`:

- `name`: nombre de la destinataria; por defecto, Princesa.
- `signature`: firma; por defecto, Alguien que sonríe por ti.
- `dedication`, `message`, `invitation`: textos de la carta.
- `intro`, `reactions`: narración y frases del dinosaurio.
- `videoId`: ID del video de YouTube, sin la URL completa. El solicitado es `b3GyAtcoogc`.
- `hits`, `lives`: ocho impactos y tres vidas de manera predeterminada. Si cambias los impactos, adapta también el tutorial y la ayuda textual.

Los textos de portada, botones y tutorial se editan directamente en `index.html`. Los colores, tamaños y puntos de adaptación están en `style.css`. No hace falta compilar.

## Cómo jugar

| Acción | Computadora | Celular |
| --- | --- | --- |
| Caminar | A/D o ←/→ | Botones ←/→ |
| Saltar | Espacio o ↑ | Botón Saltar |
| Lanzar | F | Botón Lanzar |
| Pausar | Escape | Botón Ⅱ |

Recoge los corazones del jardín y lánzalos: se orientan al dinosaurio automáticamente. Los corazones recogidos reaparecen en diez segundos. Las plataformas son opcionales; toda la munición es accesible desde el suelo. El dinosaurio se mueve despacio y el contacto quita una vida, con 2,4 segundos de protección tras cada golpe. Al conquistarlo, entrega el sobre. Ábrelo y descubre la carta a tu ritmo. La invitación adicional solo aparece al pulsar su botón; no se recopilan respuestas ni se envían mensajes.

Los controles táctiles utilizan Pointer Events y captura por dedo para combinar movimiento y lanzamiento. La simulación se pausa al perder foco o cambiar de pestaña. Al continuar, cuenta tres segundos. La música conserva su reproductor y puede continuar mientras la partida está pausada; usa sus controles oficiales para detenerla.

## Música y efectos

El reproductor oficial de YouTube queda visible fuera del jardín, con controles y dimensiones de al menos 200 × 200 px en los anchos móviles previstos. Se configura repetición de un único video y volumen inicial al 25 %. El navegador puede bloquear el inicio automático, incluso después de una interacción: en ese caso se indica que hay que pulsar reproducir. Una restricción de inserción, red o disponibilidad no impide jugar y queda disponible el enlace **Escuchar en YouTube**.

Los sonidos del juego son sintetizados con Web Audio, se habilitan después de una interacción y se silencian con **Efectos: sí/no**. El juego no incluye analítica ni solicita datos personales. La conexión externa de YouTube está sujeta a las políticas de ese servicio.

Referencias: [YouTube IFrame Player API](https://developers.google.com/youtube/iframe_api_reference) y [parámetros oficiales](https://developers.google.com/youtube/player_parameters).

## Verificación realizada

```sh
node --check game.js
node tests/game.test.cjs
```

Se ejecutaron y aprobaron 12 grupos de pruebas sobre el código real con un DOM y Canvas simulados: portada/saludo/tutorial; introducción completa y salto; movimiento/salto/aterrizaje; recolección/regeneración; lanzamiento e impacto; vidas/invulnerabilidad/derrota/reinicio; pausa/reanudación; ocultación de pestaña; victoria a ocho impactos; sobre/carta/invitación/repetición; mensaje de error de YouTube; ejecución de dibujo en todos los estados y coordenadas en formato vertical.

**Límites:** estas pruebas no son una verificación visual en un navegador real. La herramienta de navegador disponible falló antes de abrir la página por un error de su entorno (`sandboxPolicy`). Quedan pendientes la inspección visual en escritorio y móvil, el multitáctil en un dispositivo físico, la percepción de sonidos, la duración real de una partida y la reproducción/inserción efectiva del video solicitado. Las pruebas de error de YouTube llaman al manejador local, no provocan un error real del servicio.

Antes de compartirlo, abre el sitio en tu móvil y computadora, completa una partida, prueba los botones táctiles simultáneos y comprueba la música. El movimiento respeta el tiempo de cada frame, el Canvas limita la densidad a 2×, las partículas tienen un máximo de 65 y `prefers-reduced-motion` reduce las animaciones decorativas.
