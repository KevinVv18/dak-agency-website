# Redirecciones 301 del blog

El blog de WordPress **no tiene repo**, así que las redirecciones viven solo en la
base de datos. Este archivo es el registro para poder reconstruirlas si algo se
pierde.

Se gestionan con el módulo **Redirections de Rank Math** (activo), tabla
`wp_rank_math_redirections`.

## ⚠️ El patrón NO lleva el prefijo `blog/`

WordPress está instalado en `https://dakagency.net/blog`, así que `home_url` ya
incluye `/blog`. Rank Math compara la URI **relativa a `home_url`**: si el patrón
se guarda como `blog/mi-post`, la redirección **no dispara nunca**. El patrón
correcto es `mi-post`, a secas. (Costó un intento fallido el 21-sep-2026.)

## Redirecciones activas

| # | Origen (patrón, `exact`) | Destino | Motivo |
|---|---|---|---|
| 1 | `seo-sem-chiclayo-impulsa-tu-negocio-al-exito-digital` | `/blog/agencia-seo-chiclayo/` | Canibalización: ambas páginas competían por `agencia seo en chiclayo` (pos. 32 vs 15). El post quedó en **borrador**, no borrado. |
| 2 | `zonas-seguras-de-meta` | `/blog/zonas-seguras-en-anuncios-de-meta/` | Slug viejo que daba 404 con impresiones en posición 2. |
| 3 | `zonas-seguras-en-meta-ads` | `/blog/zonas-seguras-en-anuncios-de-meta/` | Ídem. |

## Cómo añadir una

Vía WP-CLI en el servidor, usando la API del plugin (no SQL crudo, para que la
serialización de `sources` quede como Rank Math espera):

```php
\RankMath\Redirections\DB::add( array(
    'sources'     => array( array( 'pattern' => 'slug-viejo', 'comparison' => 'exact' ) ),
    'url_to'      => 'https://dakagency.net/blog/slug-nuevo/',
    'header_code' => 301,
    'status'      => 'active',
) );
```

Después, vaciar la caché (`TRUNCATE TABLE wp_rank_math_redirections_cache`) y
verificar con un parámetro anticaché, porque el CDN de Hostinger cachea:

```bash
curl -s -o /dev/null -w '%{http_code} -> %{redirect_url}' "https://dakagency.net/blog/slug-viejo/?cb=$RANDOM"
```

> `\RankMath\Redirections\Cache::purge()` **exige un argumento** en esta versión
> del plugin; llamarla sin él lanza un `ArgumentCountError`. Usa el `TRUNCATE`.

## Nota para IndexNow

IndexNow **rechaza el lote entero (400)** si alguna URL de `urlList` redirige. Al
avisar de cambios después de crear una redirección, excluye la URL de origen.
