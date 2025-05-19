const { format } = require('date-fns')
const { es } = require('date-fns/locale')

function formatFechaHoraColombiana(fechaISO) {
    const fecha = new Date(fechaISO)

    // Ajustamos la hora a la zona horaria de Colombia (UTC -5)
    const colombianTime = new Date(fecha.getTime() - (0 * 60 * 60 * 1000)) // Restamos 5 horas para ajustarnos a Colombia (UTC -5)

    const day = colombianTime.getDate()
    const month = colombianTime.toLocaleString("es-CO", { month: "long" })
    const year = colombianTime.getFullYear()

    // Formateamos las horas, minutos y segundos
    let hours = colombianTime.getHours()
    const minutes = String(colombianTime.getMinutes()).padStart(2, "0")
    const seconds = String(colombianTime.getSeconds()).padStart(2, "0")

    // Convertimos a formato 12 horas
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12
    if (hours === 0) hours = 12 // Para mostrar las 12 en lugar de 0

    // Retornamos la fecha en el formato deseado
    return `${day} de ${month} de ${year} ${hours}:${minutes}:${seconds} ${ampm}`
}


const fechaISO = new Date().toISOString()
console.log(formatFechaHoraColombiana(fechaISO))
// → 7 de mayo de 2025 11:53:00AM