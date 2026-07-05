# Sistema de Gestion de Produccion - ACME Macondo

Este proyecto es una solucion de software frontend diseñada para automatizar, controlar y optimizar los flujos operativos de la planta de produccion de la empresa ACME en la ciudad de Macondo. La aplicacion integra modulos interconectados para la autenticacion segura de personal con perfiles diferenciados, administracion completa de usuarios, control de inventario maestro con inyeccion de recetas complejas y un motor de transformacion que valida materias primas, procesa deducciones de stock en tiempo real y registra el historial de fabricacion mediante identificadores consecutivos automaticos.

## Comenzando

Estas instrucciones te iran guiando para comprender la estructura de despliegue del sistema y validar la correcta comunicacion con los servicios en la nube desde el entorno de desarrollo.

### Pre-requisitos

Al tratarse de un desarrollo basado en arquitectura limpia de lado del cliente utilizando JavaScript vanilla, no se requiere la instalacion de servidores locales de ejecucion pesados, empaquetadores ni entornos de ejecucion como Node.js.

Solo necesitas lo siguiente:

* Un navegador web moderno compatible con las especificaciones de ECMAScript 6 y la API nativa de componentes web.
* Un editor de codigo fuente como Visual Studio Code para la inspeccion y auditoria de la logica modularizada.
* Una conexion activa a internet para permitir que las peticiones asincronas de la aplicacion apunten correctamente al backend en tiempo real de Firebase.

### Instalacion

El proyecto esta diseñado para ser modular y ligero, lo que elimina pasos complejos de construccion previa (builds). El proceso de puesta en marcha consiste en la verificacion de los punteros de comunicacion.

Navega al directorio central de scripts del proyecto y abre el archivo de configuracion global:

```text
js/config.js

```

Verifica que la constante que maneja el endpoint de persistencia este apuntando correctamente a la base de datos de produccion de la planta:

```javascript
const URL_BASE_DATOS = "https://raymond-68cd6-default-rtdb.firebaseio.com";

```

Para validar el sistema con una pequeña demostracion de datos reales, abre la raiz del proyecto en tu navegador. Puedes utilizar una cuenta base preconfigurada para comprobar el inicio de sesion y la carga reactiva de las tablas de datos de Macondo sin necesidad de registrar datos desde cero:

* Numero de Identificacion: 1127047718
* Contraseña: 82HAHAHA

## Ejecutando las pruebas

El control de calidad y la estabilidad de las reglas de negocio de la planta se validan mediante tecnicas de asercion manuales orientadas al flujo operativo y pruebas de consistencia de datos directamente sobre la interfaz.

### Analice las pruebas end-to-end

Estas pruebas verifican que todo el flujo logico del negocio (desde que ingresa un material hasta que se transforma en producto terminado) sea hermetico y que el stock nunca quede en saldos negativos ante ordenes que superen la capacidad real de la planta.

Por ejemplo, al ingresar al modulo de produccion e intentar fabricar un lote de productos cuya receta JSON demande mas insumos de los existentes en la tabla de inventario, el motor interno detiene el evento `submit`, bloquea la modificacion de la base de datos y despliega una alerta explicativa especificando el faltante exacto para evitar errores en la cadena de suministros fisica.

### Y las pruebas de estilo de codificacion

Estas pruebas verifican que el diseño del software mantenga una estructura limpia, legible y mantenible por otros desarrolladores de planta, evaluando la separacion estricta de responsabilidades.

Por ejemplo, se constata que ningun script de comportamiento (`usuarios.js`, `inventario.js`, `produccion.js`) contenga credenciales hardcodeadas, delegando dicha responsabilidad exclusivamente a `config.js`. Asimismo, se audita que la barra de navegacion comun este completamente delegada al Web Component nativo `<main-nav>`, evitando la duplicacion de marcado HTML estructural.

## Despliegue

Para desplegar esta aplicacion en un entorno de produccion real, basta con subir los archivos estaticos (HTML, CSS, JS) a cualquier servicio de hosting especializado en frontend como GitHub Pages, Netlify o Vercel. Asegurate de mantener la estructura de carpetas relativas para que las importaciones de los scripts no pierdan su ruta hacia el DOM de cada vista.

## Construido con

* HTML - Estructuracion semantica de las vistas operativas de la planta.
* CSS - Diseño adaptativo basado en Custom Properties y layouts de cuadricula (Grid/Flexbox).
* JavaScript Vanilla - Logica de control de negocio, manipulacion dinamica del DOM y programacion asincrona.
* Web Components API - Encapsulamiento y reutilizacion de la interfaz de navegacion del sistema.
* Firebase Realtime Database REST API - Persistencia de datos distribuida en la nube por medio de peticiones Fetch HTTP.

## Autores

* Raymond Javier Zabala Sanchez - Desarrollo completo de la arquitectura del frontend, integracion de logica asincrona y diseño del sistema de base de datos en la nube.
