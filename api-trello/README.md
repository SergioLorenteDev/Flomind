# Instrucciones de Uso
api-trello es un servicio basado en Spring Boot y Maven. Para poder configurarlo y ejecutarlo 
se puede hacer de varias maneras, desde la linea de comandos o desde un IDE como IntelliJ.

## Configuracion
El fichero principal de configuracion - `application.yaml` - encuentra en `/src/main/resources` y
contiene los datos para configurar tanto las conexiones a la base de datos como otros parametros
del servicio. 

El fichero ha sido anotado con explicaciones para cada propiedad.

## Requisitos
> [!WARNING]
> Si vais a ejecutar el proyecto desde un IDE como [IntelliJ](https://www.jetbrains.com/es-es/idea/download/?section=windows), estos ya traen Maven y la JDK 
> embebidos; si no planeais hacerlo desde el IDE, habreis de instalar Maven y la JDK por separado.
### Instalacion de Maven y JDK
La aplicacion esta escrita en Java y por lo tanto hace falta tener una JDK instalada.
La versión de la JDK ha de ser 21 o superior - la última estable es la 25. 

Personalmente recomiendo instalar la de la fundación eclipse. Disponible en el siguiente [enlace](https://adoptium.net/es/temurin/releases?version=25&os=any&arch=any)
no os olvideis la opcion para establecer la variable de entorno `JAVA_HOME` apuntando al directorio donde
la JDK se ha instalado. Si no lo hace el instalador de la JDK lo tendreis que hacer manualmente.

Para instalar maven solo hay que [descargar](https://maven.apache.org/download.cgi) el binario colocarlo en la carpeta que mas os guste
p.ej: `C:\Program Files\apache-maven-3.9.11`. Tambien tendreis que agregar el directorio `bin`, dentro
del directorio de instalacion de maven i.e.: `C:\Program Files\apache-maven-3.9.11\bin` a la variable de entorno PATH de Windows.

### Instalación de MySQL
Para que el servicio arranque correctamente debemos tener MySQL instalado y fucionando en local
en el puerto 3306 - el puerto por defecto de MySQL. 

Ademas, para que la aplicacion pueda conectarse correctamente hace falta que hayamos 
configurado en MySQL un usuario con el nombre `sa` y contraseña `password` 

Para que el script de creacion de las tablas funcione correctamente, hemos de haber creado 
una base de datos en MySQL llamada `trello` y el usuario mencionado en el parrafo anterior 
debe tener permisos para cosultar, actualizar y crear tablas en `trello`.

## Arranque del servicio
### Desde IntelliJ
Si has cargado el proyecto en IntelliJ, iniciar el servicio es tan sencillo como darle al boton
de play en la esquina superior derecha del IDE.

### Desde la linea de comandos
El proyecto utiliza Maven para compilar, ejecutar, efectuar tests etc...

El comando para poder compilar y arrancar el servicio es `mvn spring-boot:run` y despues de ejecutarlo deberiais
ver la siguiente lineas.
```text
2025-10-18T13:43:15.620+02:00  INFO 10600 --- [main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port 8080 (http) with context path '/trello/v1'
2025-10-18T13:43:15.623+02:00  INFO 10600 --- [main] c.medac.trello.api.TrelloApiApplication  : Started TrelloApiApplication in 2.387 seconds (process running for 2.57)
```
