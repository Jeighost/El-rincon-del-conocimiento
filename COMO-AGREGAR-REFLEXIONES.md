# Cómo agregar una reflexión

Hay dos formas. Las dos funcionan desde el celular.

---

## Forma 1 · Con el editor (la más fácil)

1. Abre **https://jeighost.lat/escribir/**
2. Escribe el título, elige los temas y escribe tu texto. Ves a la derecha (o abajo en el celular) cómo va a quedar.
3. Pulsa **Publicar en GitHub**. Se abre GitHub con el archivo ya listo (si no has iniciado sesión, GitHub te lo pide).
4. Baja y pulsa el botón verde **Commit changes**.
5. Espera uno o dos minutos: la reflexión aparece sola en el inicio, en el índice, en el RSS y en el mapa del sitio.

> Si la reflexión es muy larga, el editor la copia automáticamente: en GitHub solo tienes que pegarla en el cuadro de texto antes de pulsar «Commit changes».

El editor guarda tu borrador en el navegador mientras escribes. Cuando ya esté publicada, pulsa **Empezar de nuevo**.

---

## Forma 2 · Creando el archivo a mano en GitHub

1. Entra a la carpeta **`_reflexiones`** del repositorio.
2. Pulsa **Add file → Create new file**.
3. Ponle de nombre el número siguiente: por ejemplo **`reflexion23.md`**.
   El nombre decide la dirección: `reflexion23.md` → `jeighost.lat/reflexion23/`
4. Copia esta plantilla, cambia lo necesario y pulsa **Commit changes**:

```markdown
---
title: "El título de la reflexión"
description: "Una frase corta que aparece debajo del título."
date: 2026-10-01
temas: ["Poesía", "Melancolía"]
---

Aquí va el texto.
Un Enter hace un salto de línea (ideal para poemas).

Una línea en blanco empieza un párrafo nuevo.
```

---

## Cómo escribir el texto

| Quiero… | Escribo… |
|---|---|
| Salto de línea | Solo pulsa Enter |
| Párrafo nuevo | Deja una línea en blanco |
| **Negrita** | `**así**` |
| *Cursiva* | `*así*` |
| Un subtítulo | Una línea que empiece con `## ` |
| Una cita destacada | Una línea que empiece con `> ` |
| Un separador ✦ ✦ ✦ | Una línea con `---` (con líneas en blanco antes y después) |

## Datos de la parte de arriba (entre las dos líneas `---`)

| Campo | ¿Obligatorio? | Para qué sirve |
|---|---|---|
| `title` | Sí | El título. |
| `description` | No | La frase corta bajo el título y en el índice. Si no la pones, se usa el inicio del texto. |
| `date` | Sí | La fecha (año-mes-día). Ordena las reflexiones: la más nueva sale primero. |
| `temas` | No | Los temas, entre comillas y separados por comas. Si escribes uno nuevo, se crea solo. |
| `video` | No | Un enlace de YouTube. Aparece en la reflexión y en la página de Videos. |
| `audio` | No | Solo si el audio tiene otro nombre (mira abajo). |

## Audio narrado

Sube el archivo a la carpeta **`audios`** con el mismo nombre que la reflexión:
`reflexion23.md` → `audios/reflexion23.mp3`.
El reproductor aparece solo. No hay que tocar nada más.

## Corregir una reflexión ya publicada

En **https://jeighost.lat/escribir/**, al final, está la lista de todas las reflexiones con un enlace para editarlas en GitHub. También puedes abrir el archivo en la carpeta `_reflexiones`, pulsar el lápiz ✏️, cambiar y pulsar **Commit changes**.

## Galería

1. Sube la imagen a la carpeta `assets/galeria/`.
2. Abre `_data/galeria.yml` y agrega:
   ```yaml
   - imagen: /assets/galeria/nombre-de-la-imagen.webp
     texto: Una frase que explique la imagen.
   ```
   (y borra la línea `[]` del final si todavía está).

Cuando haya al menos una imagen, «Galería» aparece sola en el menú.

## Si algo sale mal

Si después de unos minutos la reflexión no aparece, entra a la pestaña **Actions** del repositorio en GitHub: ahí se ve si la publicación falló y en qué línea. Lo más común es una comilla `"` sin cerrar en la parte de arriba del archivo.
