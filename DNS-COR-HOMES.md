# Conectar cor.homes

Proveedor DNS actual: DonDominio. Los nombres de servidor continúan siendo ns1.dondominio.com y ns2.dondominio.com; no hay que cambiarlos.

El nuevo alojamiento tiene registrados cor.homes y www.cor.homes. La validación y el certificado HTTPS están pendientes del cambio DNS.

## Registros para la nueva web

| Tipo | Nombre en la zona cor.homes | Valor |
|---|---|---|
| A | @ | 162.159.143.30 |
| A | @ | 172.66.3.26 |
| CNAME | www | custom-domains.chatgpt.site. |
| TXT | _openai-site-verification | openai-site-verification=YF-DkPu_LCTgyFHTdeLf9fVAlPQtBRg3OswqTjd_dWA |
| TXT | _cf-custom-hostname | b4b39bd7-194c-420f-be42-32e1c26ef213 |
| TXT | _openai-site-verification.www | openai-site-verification=wgypocMB8oGj5ff5M-J6g-uk81D6l4i40n1qMIoUdS0 |
| TXT | _cf-custom-hostname.www | 5938e405-bbfe-4e1a-8db2-bf00498aacfa |

Al cambiar la web se sustituyen los cuatro registros A actuales de GitHub (185.199.108.153, 185.199.109.153, 185.199.110.153 y 185.199.111.153) y el CNAME www actual manelruedabcn.github.io. No modificar los registros de correo ni otros servicios. Antes de cambiar, revisar si existen registros AAAA para las mismas entradas y retirar únicamente los que dirijan al alojamiento web anterior.

Añadir primero las validaciones TXT. Tras el cambio de los registros de tráfico, refrescar el estado de ambos dominios en Sites, esperar validación y HTTPS activos y comprobar la portada, /comprar, /autopromocion, el configurador, /en y la protección de /admin.

## Estructura

- https://cor.homes/ — inmobiliaria COR HOMES · Real Estate.
- https://cor.homes/autopromocion — sección interna de autopromoción asistida.
- https://cor.homes/configurador/configurador-v2.html — motor original de configuración.

El cambio no está completado hasta verificar los registros públicos y que cor.homes sirve la web nueva con HTTPS.

## Estado comprobado — 23 de octubre de 2026

Cambio realizado en DonDominio. cor.homes y www.cor.homes figuran activos en Sites, con certificado HTTPS activo. Ambos dominios responden 200 y muestran la nueva propuesta de COR HOMES. Verificados los accesos a compra, autopromoción, configurador e inglés; API administrativa rechaza visitantes anónimos. Correo y otros subdominios conservados. La web es pública y el panel está restringido al propietario.
