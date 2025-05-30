// server.js
import express from 'express'
import fetch from 'node-fetch'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()


const app = express()
app.use(cors()) // Permite requests desde el frontend
app.use(express.json())

const loginUrl = 'https://prod-p.superpay.com.co/api/router-bck/api/router-bck/merchants/login/bluelink'
const postUrl = 'https://prod-nop.superpay.com.co/api/payments/payment-links'
const basicToken = process.env.NEXT_PUBLIC_SUPERPAY_BASIC_TOKEN

app.post('/api/generate-link', async (req, res) => {
  try {
    // Paso 1: Autenticación
    const loginRes = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicToken}`
      }
    })
    const loginData = await loginRes.json()
    const accessToken = loginData.accessToken

    if (!accessToken) {
      return res.status(500).json({ error: 'No se pudo autenticar con SuperPay' })
    }

    // Paso 2: Generar enlace de pago
    let attempt = 0
    const maxAttempts = 5
    let finalResponse = null

    while (attempt < maxAttempts) {
      const externalId = `00000012-${Math.floor(100000000 + Math.random() * 900000000)}`
      const payload = { ...req.body, externalId }

      const createRes = await fetch(postUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-token': `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload)
      })

      const data = await createRes.json()

      if (createRes.ok) {
        finalResponse = data
        break
      } else if (
        data.code === 'PAYMENTS_ERROR_000' &&
        data.message?.includes('external id already exists')
      ) {
        attempt++
      } else {
        return res.status(500).json({ error: data.message })
      }
    }

    if (finalResponse) {
      res.json(finalResponse)
    } else {
      res.status(500).json({ error: 'No se pudo generar el enlace de pago' })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})






export async function fetchTransactionStatus(externalId) {
  if (!externalId || !externalId.trim()) {
    throw new Error("Por favor ingrese un CUS ID válido")
  }

  const loginUrl = "https://prod-p.superpay.com.co/api/router-bck/terminals/login"
  const inquiryUrl = "https://prod-p.superpay.com.co/api/router-bck/transactions/transaction-by-external-id"

  const credentials = {
    userName: process.env.NEXT_PUBLIC_SUPERPAY_USER,
    password: process.env.NEXT_PUBLIC_SUPERPAY_PASS,
    terminalId: process.env.NEXT_PUBLIC_SUPERPAY_TERMINAL_ID,
  }

  try {
    // Paso 1: Login
    const loginResponse = await fetch(loginUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    })

    if (!loginResponse.ok) {
      throw new Error("Error al autenticar con SuperPay")
    }

    const { apiToken } = await loginResponse.json()
    if (!apiToken) throw new Error("Token no recibido")

    // Paso 2: Consulta transacción
    const trxBody = {
      originalExternalId: externalId,
      apiToken,
      terminalId: credentials.terminalId,
    }

    const trxResponse = await fetch(inquiryUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(trxBody),
    })

    if (!trxResponse.ok) {
      if (trxResponse.message == "Transaction not found") {
        throw new Error("La transacción que intentas consultar no existe'")
      } else {
        throw new Error("Error al consultar la transacción")
      }

    }

    const trxData = await trxResponse.json()
    const extraData = trxData.extraJsonData10
      ? JSON.parse(trxData.extraJsonData10)
      : {}

    const statusMap = {
      APPROVED: "Aprobada",
      PENDING: "Pendiente",
      DECLINED: "Rechazada/Fallida",
      ERROR: "Rechazada/Fallida",
    }

    return {
      cusId: externalId,
      status: statusMap[trxData.trxStatus] || "Desconocido",
      amount: `S/ ${parseFloat(trxData.authAmount || "0").toFixed(2)}`,
      paymentDate: trxData.dtRequest,
      customerName: extraData.fullName,
      customerLastName: "", // puedes separar si lo necesitas
      customerEmail: extraData.email,
      documentNumber: extraData.identificationNumber,
      paymentMethod: trxData.paymentDescription,
      transactionReference: trxData.externalId,
      bankName: trxData.bankInfo,
      cardLastDigits: trxData.extraData1,
      cellphoneNumber: extraData.cellphoneNumber,
      address: extraData.address,
      placa: trxData.extraData1,
    }
  } catch (err) {
    console.error("Error:", err)
    throw new Error(err.message || "Error inesperado al consultar transacción")
  }
}



app.post('/api/consultar-transaccion', async (req, res) => {
  const { externalId } = req.body

  try {
    const result = await fetchTransactionStatus(externalId)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})








const PORT = 4000
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API corriendo en http://0.0.0.0:${PORT}`)
})
