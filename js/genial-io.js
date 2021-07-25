// Funciones

function generadorPromedio(listaDiurno, listaTarde) {
    // Esta función genera un lista con 2 ítems, el índice 0 contiene el porcentaje del
    // promedio de la jornada diurna y el índice 1  contiene el porcentaje del
    // promedio de la tarde.
    let suma = 0;
    for (const index in listaDiurno) {
        suma += listaDiurno[0].utilizacion_turno_porcentual;
    }
    const promedioDia = suma / listaDiurno.length;

    suma = 0;
    for (const index in listaTarde) {
        suma += listaTarde[0].utilizacion_turno_porcentual;
    }

    const promedioTarde = suma / listaTarde.length;
    return [promedioDia, promedioTarde];
}

function creadorListaFecha(objeto) {
    // Esta función genera una lista con todas las fechas registradas.
    let listaFecha = [];
    for (const index in objeto) {
        const fechaYHoraTemp = objeto[index].date.split(":");
        const fechaTmp = fechaYHoraTemp[0].split(" ");
        const fecha = fechaTmp[0];
        listaFecha.push(fecha);
    }
    let listaFinal = listaFecha.filter((item, index) => {
        return listaFecha.indexOf(item) === index;
    });
    return listaFinal.reverse();
}

function separadorDeJornadas(objeto) {
    // Esta función determina si es de la jornada diurna o no.
    let listaJornadaDiurna = [];
    let listaJornadaTarde = [];
    for (const index in objeto) {
        const splitFechaHora = objeto[index].date.split(" ")[1];
        const SplitJornada = splitFechaHora.split(":")[0];
        if (SplitJornada === "06") {
            listaJornadaDiurna.push(objeto[index]);
        } else {
            listaJornadaTarde.push(objeto[index]);
        }
    }
    return [listaJornadaTarde, listaJornadaDiurna];
}

function creadorListaData(objeto) {
    // Según la jornada que se le pasa a esta función retorna una lista con el
    //porcentaje de producción y un string con los posibles comentarios el
    //timestamp y la fecha y hora.
    let listaComentario = [];
    for (const index in objeto) {
        if (objeto[index].context_utilizacion_turno.comment) {
            comentario = `${objeto[index].context_utilizacion_turno.comment}
            (TimeStamp: ${objeto[index].timestamp}, Fecha ${objeto[index].date})`;
        } else {
            comentario = `(TimeStamp: ${objeto[index].timestamp},
                Fecha ${objeto[index].date})`;
        }
        listaComentario.push([
            comentario,
            objeto[index].utilizacion_turno_porcentual,
        ]);
    }
    return listaComentario.reverse();
}

function otrosPorcentajes(data) {
    // En esta función se genera una lista anidada con 3 listas,
    // cada una con un comentarios y su respectivo valor, ya sea valor más alto,
    // valor más bajo y promedio general.
    let masAlto = ["", 0.0];
    let masBajo = ["", 100.0];
    let promedio = ["Promedio general"];
    let suma = 0;

    for (const index in data) {
        if (masAlto[1] < data[index].utilizacion_turno_porcentual) {
            // Aquí encuentra el porcentaje más alto
            if (data[index].context_utilizacion_turno.comment) {
                masAlto[0] = `${data[index].context_utilizacion_turno.comment}
                (TimeStamp: ${data[index].timestamp}, Fecha ${data[index].date})`;
            } else {
                masAlto[0] = `(TimeStamp: ${data[index].timestamp},
                    Fecha ${data[index].date})`;
            }
            masAlto[1] = data[index].utilizacion_turno_porcentual;
        }
        if (
            masBajo[1] > data[index].utilizacion_turno_porcentual &&
            data[index].utilizacion_turno_porcentual > 0.0
        ) {
            // Aquí encuentra el porcentaje más bajo
            if (data[index].timestamp === 0) {
                //pass
            } else if (data[index].context_utilizacion_turno.comment) {
                masBajo[0] = `${data[index].context_utilizacion_turno.comment}
                (TimeStamp: ${data[index].timestamp}, Fecha ${data[index].date})`;
            } else {
                masBajo[0] = `(TimeStamp: ${data[index].timestamp},
                    Fecha ${data[index].date})`;
            }
            masBajo[1] = data[index].utilizacion_turno_porcentual;
        }
        suma += data[index].utilizacion_turno_porcentual;
    }
    // Aquí calcula el promedio del porcentaje general
    const promedioTmp = suma / data.length;
    promedio.push(promedioTmp);
    let porcentajes = [];

    porcentajes.push(promedio);
    porcentajes.push(masAlto);
    porcentajes.push(masBajo);
    return porcentajes;
}

function generarGraficos(data) {
    // En esta función se ejecutan las funciones previas y se realiza el
    // proceso de graficación de los datos con Highcharts.

    const listaFecha = creadorListaFecha(data);
    const listaTarde = separadorDeJornadas(data)[0];
    const listaDiurno = separadorDeJornadas(data)[1];
    const jornadaDiurna = creadorListaData(listaDiurno);
    const jornadaTarde = creadorListaData(listaTarde);
    const promedioDia = generadorPromedio(listaDiurno, listaTarde)[0];
    const promedioTarde = generadorPromedio(listaDiurno, listaTarde)[1];
    const porcentajes = otrosPorcentajes(data);

    // Highcharts

    // Gráfica de área
    // Compara jornada diurna con jornada nocturna a detalle
    const chart = Highcharts.chart("container-general", {
        chart: {
            type: "area",
        },
        xAxis: {
            categories: listaFecha,
        },
        yAxis: {
            title: {
                text: "Porcentaje de productividad",
            },
        },
        series: [
            {
                color: "#90ed7d",
                name: "Jornada diurna (06:00)",
                data: jornadaDiurna,
                marker: {
                    radius: 5,
                },
                lineWidth: 3,
            },
            {
                name: "Jornada tarde (14:00)",
                data: jornadaTarde,
                marker: {
                    radius: 5,
                },
            },
        ],
        title: {
            text: "Porcentaje de productividad según jornada",
        },
        subtitle: {
            text: "Genial.io",
        },
        tooltip: {
            shared: false, // En el Popup muestra los 2 valores de día y tarde
            crosshairs: true, // Sombra Vertical
        },
        legend: {
            align: "left",
            verticalAlign: "top",
            borderWidth: 0,
        },
        credits: {
            enabled: false,
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: "{point.y:.1f}%",
                },
            },
        },
    });

    // gráfica de pie
    // compara jornada diurna con jornada nocturna según el promedio de cada una.

    Highcharts.chart("container-pie", {
        chart: {
            type: "pie",
        },
        title: {
            text: "Promedio de porcentaje de productividad",
        },
        subtitle: {
            text: "(Diurna vs Tarde)",
        },
        series: [
            {
                name: "Promedio",
                colorByPoint: false, // permite que sean mas de 1 color por defecto
                data: [
                    {
                        color: "#90ed7d",
                        name: "Jornada diurna",
                        y: promedioDia,
                        sliced: true, // hace que sobresalga las rebanadas
                    },
                    {
                        color: "#7cb5ec",
                        name: "Jornada tarde",
                        y: promedioTarde,
                    },
                ],
            },
        ],
        credits: {
            enabled: false,
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: "{point.name:.1f}: {point.y:.1f}%",
                },
            },
        },
    });

    // gráfica de columnas
    // Muestra el promedio general, porcentaje más alto registrado y el más bajo registrado.

    const chartBar = Highcharts.chart("container-estadisticas-generales", {
        chart: {
            type: "column",
        },
        xAxis: {
            categories: [
                "Porcentaje promedio",
                "Porcentaje más alto registrado",
                "Porcentaje más bajo registrado",
            ],
        },
        yAxis: {
            title: {
                text: "Porcentaje de productividad",
            },
        },
        series: [
            {
                name: "",
                colorByPoint: true,
                data: porcentajes,
            },
        ],
        title: {
            text: "Otros porcentajes",
        },
        credits: {
            enabled: false,
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: "{point.y:.1f}%",
                },
            },
        },
    });
}

// Datos extraídos del CSV
data = [
    {
        timestamp: 1624302000000,
        utilizacion_turno_porcentual: 16.59923611,
        context_utilizacion_turno: {},
        date: "2021-06-21 14:00:00-05:00",
    },
    {
        timestamp: 1624273200000,
        utilizacion_turno_porcentual: 53.49888889,
        context_utilizacion_turno: {},
        date: "2021-06-21 06:00:00-05:00",
    },
    {
        timestamp: 1624129200000,
        utilizacion_turno_porcentual: 41.22114583,
        context_utilizacion_turno: {},
        date: "2021-06-19 14:00:00-05:00",
    },
    {
        timestamp: 1624100400000,
        utilizacion_turno_porcentual: 44.654375,
        context_utilizacion_turno: {},
        date: "2021-06-19 06:00:00-05:00",
    },
    {
        timestamp: 1624042800000,
        utilizacion_turno_porcentual: 38.466875,
        context_utilizacion_turno: {},
        date: "2021-06-18 14:00:00-05:00",
    },
    {
        timestamp: 1624014000000,
        utilizacion_turno_porcentual: 29.07234375,
        context_utilizacion_turno: {
            comment:
                "MUCHA PRDIDA DE TIEMPO POR DISEÑOS SUSPENDIDOS DOS POR GRABACION Y UNO POR RAYAS EN EL  ESTAMPADO ",
        },
        date: "2021-06-18 06:00:00-05:00",
    },
    {
        timestamp: 1623956400000,
        utilizacion_turno_porcentual: 46.61229167,
        context_utilizacion_turno: {},
        date: "2021-06-17 14:00:00-05:00",
    },
    {
        timestamp: 1623927600000,
        utilizacion_turno_porcentual: 31.65109375,
        context_utilizacion_turno: {},
        date: "2021-06-17 06:00:00-05:00",
    },
    {
        timestamp: 1623870000000,
        utilizacion_turno_porcentual: 33.27069444,
        context_utilizacion_turno: {},
        date: "2021-06-16 14:00:00-05:00",
    },
    {
        timestamp: 1623841200000,
        utilizacion_turno_porcentual: 48.68222222,
        context_utilizacion_turno: {},
        date: "2021-06-16 06:00:00-05:00",
    },
    {
        timestamp: 1623783600000,
        utilizacion_turno_porcentual: 40.24986111,
        context_utilizacion_turno: {},
        date: "2021-06-15 14:00:00-05:00",
    },
    {
        timestamp: 1623754800000,
        utilizacion_turno_porcentual: 40.22708333,
        context_utilizacion_turno: {},
        date: "2021-06-15 06:00:00-05:00",
    },
    {
        timestamp: 0,
        utilizacion_turno_porcentual: 0.0,
        context_utilizacion_turno: { comment: "Sin registro" },
        date: "2021-06-14 14:00:00-05:00",
    },
    {
        timestamp: 1623668400000,
        utilizacion_turno_porcentual: 25.67638889,
        context_utilizacion_turno: {},
        date: "2021-06-14 06:00:00-05:00",
    },
    {
        timestamp: 1623524400000,
        utilizacion_turno_porcentual: 36.989375,
        context_utilizacion_turno: {},
        date: "2021-06-12 14:00:00-05:00",
    },
    {
        timestamp: 1623495600000,
        utilizacion_turno_porcentual: 48.82614583,
        context_utilizacion_turno: {},
        date: "2021-06-12 06:00:00-05:00",
    },
    {
        timestamp: 1623438000000,
        utilizacion_turno_porcentual: 45.32635417,
        context_utilizacion_turno: {},
        date: "2021-06-11 14:00:00-05:00",
    },
    {
        timestamp: 1623409200000,
        utilizacion_turno_porcentual: 48.92614583,
        context_utilizacion_turno: {},
        date: "2021-06-11 06:00:00-05:00",
    },
    {
        timestamp: 1623351600000,
        utilizacion_turno_porcentual: 39.14348958,
        context_utilizacion_turno: {},
        date: "2021-06-10 14:00:00-05:00",
    },
    {
        timestamp: 1623322800000,
        utilizacion_turno_porcentual: 37.486875,
        context_utilizacion_turno: {},
        date: "2021-06-10 06:00:00-05:00",
    },
    {
        timestamp: 1623265200000,
        utilizacion_turno_porcentual: 49.13138889,
        context_utilizacion_turno: {},
        date: "2021-06-09 14:00:00-05:00",
    },
    {
        timestamp: 1623236400000,
        utilizacion_turno_porcentual: 40.16583333,
        context_utilizacion_turno: {
            comment: "SE PIERDE  MUCHO TIEMPO MATIZANDO COLO DE MAQUILA",
        },
        date: "2021-06-09 06:00:00-05:00",
    },
    {
        timestamp: 1623178800000,
        utilizacion_turno_porcentual: 45.92652778,
        context_utilizacion_turno: {},
        date: "2021-06-08 14:00:00-05:00",
    },
    {
        timestamp: 1623150000000,
        utilizacion_turno_porcentual: 47.97388889,
        context_utilizacion_turno: {},
        date: "2021-06-08 06:00:00-05:00",
    },
    {
        timestamp: 0,
        utilizacion_turno_porcentual: 0.0,
        context_utilizacion_turno: { comment: "Sin registro" },
        date: "2021-06-07 14:00:00-05:00",
    },
    {
        timestamp: 1623063600000,
        utilizacion_turno_porcentual: 45.45666667,
        context_utilizacion_turno: {},
        date: "2021-06-07 06:00:00-05:00",
    },
    {
        timestamp: 0,
        utilizacion_turno_porcentual: 0.0,
        context_utilizacion_turno: { comment: "Sin registro" },
        date: "2021-06-06 14:00:00-05:00",
    },
    {
        timestamp: 1622977200000,
        utilizacion_turno_porcentual: 1.115416667,
        context_utilizacion_turno: {},
        date: "2021-06-06 06:00:00-05:00",
    },
    {
        timestamp: 1622919600000,
        utilizacion_turno_porcentual: 50.04770833,
        context_utilizacion_turno: {},
        date: "2021-06-05 14:00:00-05:00",
    },
    {
        timestamp: 1622890800000,
        utilizacion_turno_porcentual: 50.82548611,
        context_utilizacion_turno: {},
        date: "2021-06-05 06:00:00-05:00",
    },
    {
        timestamp: 1622833200000,
        utilizacion_turno_porcentual: 42.95798611,
        context_utilizacion_turno: {},
        date: "2021-06-04 14:00:00-05:00",
    },
    {
        timestamp: 1622804400000,
        utilizacion_turno_porcentual: 64.5034375,
        context_utilizacion_turno: {},
        date: "2021-06-04 06:00:00-05:00",
    },
    {
        timestamp: 1622746800000,
        utilizacion_turno_porcentual: 35.82673611,
        context_utilizacion_turno: {},
        date: "2021-06-03 14:00:00-05:00",
    },
    {
        timestamp: 1622718000000,
        utilizacion_turno_porcentual: 32.43114583,
        context_utilizacion_turno: {},
        date: "2021-06-03 06:00:00-05:00",
    },
    {
        timestamp: 1622660400000,
        utilizacion_turno_porcentual: 48.33828125,
        context_utilizacion_turno: {},
        date: "2021-06-02 14:00:00-05:00",
    },
    {
        timestamp: 1622631600000,
        utilizacion_turno_porcentual: 39.63432292,
        context_utilizacion_turno: {},
        date: "2021-06-02 06:00:00-05:00",
    },
    {
        timestamp: 1622574000000,
        utilizacion_turno_porcentual: 48.2434375,
        context_utilizacion_turno: {
            comment:
                "SE PIERDE TIEMPO POR COLORES SIN COLAR Y POR PROBLEMAS CON EL AGUA MUY POCA PRESION",
        },
        date: "2021-06-01 14:00:00-05:00",
    },
    {
        timestamp: 1622545200000,
        utilizacion_turno_porcentual: 38.07515625,
        context_utilizacion_turno: {},
        date: "2021-06-01 06:00:00-05:00",
    },
];

// Ejecución de todo el código :)
generarGraficos(data);
