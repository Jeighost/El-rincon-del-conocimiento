# El rincón del conocimiento

Reflexiones filosóficas y poemas de Jeison Gonzalez.
**Sitio:** https://jeighost.lat/

## ¿Quieres publicar una reflexión?

Lee **[COMO-AGREGAR-REFLEXIONES.md](COMO-AGREGAR-REFLEXIONES.md)**. En resumen: entra a
**https://jeighost.lat/escribir/**, escribe y pulsa «Publicar en GitHub».

## Cómo está hecho

El sitio lo construye GitHub Pages con [Jekyll](https://jekyllrb.com/) cada vez que hay un cambio.
No hay que compilar nada ni subir páginas HTML a mano.

```
_reflexiones/        Cada archivo .md es una reflexión (reflexion1.md → /reflexion1/)
audios/              Audios narrados (reflexion2.mp3 aparece solo en /reflexion2/)
_data/galeria.yml    Imágenes de la galería
_layouts/            Plantillas: base, página y reflexión
_includes/           Piezas reutilizables: cabecera, pie, íconos, fechas…
assets/css/main.css  Todo el diseño (modo noche y modo papel)
assets/js/main.js    Tema, menú, audio, buscador, compartir, cookies y avisos
assets/js/comentarios.js  Comentarios (Firebase)
assets/js/escribir.js     Editor de /escribir/
index.html           Inicio
reflexiones/         Índice con buscador y filtro por tema
escribir/            Editor para publicar (no aparece en buscadores)
feed.xml             RSS (se genera solo)
_config.yml          Configuración del sitio
```

## Probarlo en tu computador (opcional)

```bash
gem install bundler github-pages webrick
jekyll serve
```

y abre http://localhost:4000.

## Licencia

Código bajo licencia MIT. Los textos de las reflexiones son de su autor.
