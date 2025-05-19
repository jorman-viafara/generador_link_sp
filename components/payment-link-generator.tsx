"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Copy, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import Swal from 'sweetalert2';
import ReactDOMServer from 'react-dom/server';

import { format } from 'date-fns'
import { es } from 'date-fns/locale'


interface PaymentLinkResponse {
  link: string
  cusId: string
  status: string
  date: string
  fullName: string
  email: string
  amount: string
  documentNumber: string
  terminalId: string
  expirationDate: string
  paymentMethod: string
  plaque: string
}

export default function PaymentLinkGenerator() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [amount, setAmount] = useState("")
  const [documentNumber, setDocumentNumber] = useState("")

  const [documentType, setDocumentType] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [plaque, setPlaque] = useState("")

  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<PaymentLinkResponse | null>(null)
  const [copied, setCopied] = useState(false)
  const [copiedEid, setCopiedEid] = useState(false)
  const [isFormValid, setIsFormValid] = useState(false)

  const [amountFormatted, setAmountFormatted] = useState("")
  const [amountRaw, setAmountRaw] = useState("")
  const [isFocused, setIsFocused] = useState(false)

  // Añadir este useEffect para validar el formulario
  useEffect(() => {
    const allFieldsFilled = [fullName, email, amountRaw, documentNumber, documentType, customerAddress, phone, plaque].every(val => val.trim() !== "");
    setIsFormValid(allFieldsFilled);
  }, [fullName, email, amountRaw, documentNumber, documentType, customerAddress, phone, plaque]);



  const generateLink = async () => {
    setLoading(true)

    const generateExternalId = () => `00026626-${Math.floor(100000000 + Math.random() * 900000000)}`
    const now = new Date()
    const expires = new Date(now.getTime() + 2 * 60 * 60 * 1000) // +2 horas

    const payloadBase = {
      billingDocument: documentNumber,
      billingDocumentType: documentType,
      cancelCallbackUrl: "http://url:8080/ws/launcher/response-fromgateway?status=CANCEL",
      client: "supergiros",
      countryIsoCode: "COL",
      currency: "170",
      customerAddress: customerAddress,
      customerEmail: email,
      customerName: fullName,
      customerPhone: phone,
      enableNiubizSetting: "false",
      errorCallbackUrl: "http://url:8080/ws/launcher/response-fromgateway?status=ERROR",
      origin: "https://sbx.superpay.com.co/ws/launcher/payment-form",
      paymentShippingAddress: "prueba 8c",
      taxAmount: 0.0,
      extraTaxAmount: 0.0,
      mode: "redirect",
      method: "pse",
      terminalId: "26626",
      totalAmount: parseFloat(amountRaw),
      branchName: "BRANCH_ACH",
      maxInstallmentCount: 1,
      paymentRequiresLogin: "true",
      rejectCallbackUrl: "http://url:8080/ws/launcher/response-fromgateway?status=REJECT",
      successCallbackUrl: "http://url:8080/ws/launcher/response-fromgateway?status=SUCCESS",
      invoiceNumber: `test-${Math.floor(Math.random() * 10000)}`,
      startsAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      billingCity: "BOGOTA",
      billingCountryIsoCode: "170",
      extraData1: plaque,
      extraData2: "dato extra 2",
      extraData3: "dato extra 3"
    }

    const postUrl = "https://dev.superpay.com.co/api/payments/payment-links"
    const apiToken = `Bearer ${process.env.NEXT_PUBLIC_SUPERPAY_TOKEN}`
    let attempt = 0
    let maxAttempts = 5
    let finalResponse = null

    while (attempt < maxAttempts) {
      const externalId = generateExternalId()
      const payload = { ...payloadBase, externalId }

      try {
        const res = await fetch(postUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-token": apiToken
          },
          body: JSON.stringify(payload)
        })

        const data = await res.json()

        if (res.ok) {
          finalResponse = {
            email: email,
            fullName: fullName,
            amount: `$ ${data.totalAmount}`,
            documentNumber: documentNumber,
            terminalId: data.terminalId,
            status: data.status,
            date: new Date().toLocaleString(),
            link: data.link,
            cusId: data.externalId,
            expirationDate: expires.toLocaleString(),
            paymentMethod: "PSE",
            plaque: data.extraData1
          }
          break
        } else if (
          data.code === "PAYMENTS_ERROR_000" &&
          data.message?.includes("external id already exists")
        ) {
          attempt++
          continue
        } else {
          throw new Error(data.message || "Error desconocido")
        }
      } catch (error) {
        console.error("Error al generar enlace de pago:", error)
        break
      }
    }

    if (finalResponse) {
      setResponse(finalResponse)
    } else {
      alert("No se pudo generar el enlace de pago. Inténtalo de nuevo.")
    }

    setLoading(false)
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await generateLink()
  }


  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyToClipboard2 = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedEid(true)
    setTimeout(() => setCopiedEid(false), 2000)
  }




  const formatFechaHoraColombiana = (fechaPersonalizada: string): string => {
    // Suponemos formato: "14/5/2025, 17:14:50"
    const [fechaParte, horaParte] = fechaPersonalizada.split(', ')
    const [dia, mes, anio] = fechaParte.split('/').map(Number)
    const [horas, minutos, segundos] = horaParte.split(':').map(Number)

    // Creamos el objeto Date con los datos extraídos
    const fecha = new Date(anio, mes - 1, dia, horas, minutos, segundos)

    // Colombia UTC-5 (puedes ajustar con Intl si quieres exactitud con horarios de verano)
    const colombianTime = new Date(fecha.getTime() - (0 * 60 * 60 * 1000))

    const day = colombianTime.getDate()
    const month = colombianTime.toLocaleString("es-CO", { month: "long" })
    const year = colombianTime.getFullYear()

    let hours = colombianTime.getHours()
    const min = String(colombianTime.getMinutes()).padStart(2, "0")
    const sec = String(colombianTime.getSeconds()).padStart(2, "0")

    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12
    if (hours === 0) hours = 12

    return `${day} de ${month} de ${year} ${hours}:${min}:${sec} ${ampm}`
  }



  const formatNumberToCOP = (value: string) => {
    const number = parseInt(value || "0", 10)
    return number.toLocaleString("es-CO")
  }

  const formatNumberToCOP2 = (value: string | number): string => {
    const number = parseInt(value?.toString().replace(/\D/g, "") || "0", 10);
    return number.toLocaleString("es-CO");
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "") // Quitar todo lo que no sea número
    setAmountRaw(raw)
  }




  // marca de agua
  const WatermarkContent = () => (
    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem', alignItems: 'center', gap: '1.5rem' }}>
        <span style={{ background: 'linear-gradient(to right, #23dce1, #0057ff)', WebkitBackgroundClip: 'text', color: 'transparent', fontWeight: 'bold' }}>jsvrDEV</span>
        <div style={{ width: '1px', height: '24px', background: 'linear-gradient(to bottom, #23dce1, #0057ff)' }} />
        <span style={{ background: 'linear-gradient(to right, #0057ff, #23dce1)', WebkitBackgroundClip: 'text', color: 'transparent', fontWeight: 'bold' }}>jormanDEV</span>
      </div>
      <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.5rem' }}>
        © {new Date().getFullYear()} Bluelink BPO. Todos los derechos reservados
      </p>
    </div>
  );

  const footerHTML = ReactDOMServer.renderToStaticMarkup(<WatermarkContent />);








  const handleConfirmation = async () => {
    if (!isFormValid || loading) return;

    const result = await Swal.fire({
      title: '¿Estás seguro?',
      html: `
        <p><strong>Recuerda revisar el precio agregado</strong> y verificar que el link tenga el precio correcto.</p>
        <small style="display:block;margin-top:12px;color:#666;">
          No nos hacemos responsables por el mal uso de esta herramienta ni por pagos con error.
          <br />Revisa muy bien todo antes de entregar el link de pago al cliente final.
        </small>
      `,
      footer: footerHTML,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, generar enlace',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-lg',
        confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded',
        cancelButton: 'bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded',
        actions: 'flex gap-4 justify-center mt-4', // aquí agregamos espaciado real
      },
      buttonsStyling: false,
    });

    if (result.isConfirmed) {
      await generateLink(); // Tu lógica real de generación
    }
  };






  return (
    <Card className="shadow-lg border-0 gradient-border card-hover overflow-hidden relative">
      <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-lg z-0"></div>

      {/* Marca de agua en la esquina superior derecha */}
      <div className="absolute top-3 right-3 text-xs font-medium text-gray-300 opacity-30 z-10">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#23dce1] to-[#0057ff]">jsvrDEV</span>
      </div>

      <CardHeader className="relative z-10 pb-2">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
              <path d="M8 7V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1" />
              <path d="M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
              <path d="M16 12h.01" />
              <path d="M8 12h.01" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold gradient-text">Generar enlace de pago</CardTitle>
        </div>
        <CardDescription className="text-gray-600">
          Complete los datos para generar un enlace de pago seguro
        </CardDescription>
      </CardHeader>
      <CardContent className="relative z-10">
        <form onSubmit={handleConfirmation} className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <Label htmlFor="fullName" className="text-sm font-medium">
                Nombre completo
              </Label>
              <Input
                id="fullName"
                placeholder="Ingrese nombre completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="border-gray-300 focus:border-primary focus:ring-primary transition-all duration-300"
              />
            </div>

            <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Label htmlFor="email" className="text-sm font-medium">
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-gray-300 focus:border-primary focus:ring-primary transition-all duration-300"
              />
            </div>

            <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <Label htmlFor="amount" className="text-sm font-medium">
                Monto a recibir
              </Label>
              <Input
                id="amount"
                type="text"
                inputMode="numeric"
                placeholder="0.00"
                value={isFocused ? amountRaw : formatNumberToCOP(amountRaw)}
                onChange={handleChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                required
                className="border-gray-300 focus:border-primary focus:ring-primary transition-all duration-300"
              />
            </div>

            <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.4s" }}>
              <Label htmlFor="documentType" className="text-sm font-medium">
                Tipo de documento
              </Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger
                  id="documentType"
                  className="border-gray-300 focus:border-primary focus:ring-primary transition-all duration-300"
                >
                  <SelectValue placeholder="Seleccione el tipo de documento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CC">Cédula de ciudadanía - CC</SelectItem>
                  <SelectItem value="CE">Cédula de extranjería - CE</SelectItem>
                  <SelectItem value="NIT">NIT - NIT</SelectItem>
                  <SelectItem value="TI">Tarjeta de identidad - TI</SelectItem>
                  <SelectItem value="PAS">Pasaporte - PAS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.4s" }}>
              <Label htmlFor="documentNumber" className="text-sm font-medium">
                Número de documento
              </Label>
              <Input
                id="documentNumber"
                placeholder="Ingrese número de documento"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                required
                className="border-gray-300 focus:border-primary focus:ring-primary transition-all duration-300"
              />
            </div>

            <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.4s" }}>
              <Label htmlFor="customerAddress" className="text-sm font-medium">
                Direccion cliente
              </Label>
              <Input
                id="customerAddress"
                placeholder="Ingrese la direccion"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                required
                className="border-gray-300 focus:border-primary focus:ring-primary transition-all duration-300"
              />
            </div>

            <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.4s" }}>
              <Label htmlFor="phone" className="text-sm font-medium">
                Celular cliente
              </Label>
              <Input
                id="phone"
                placeholder="Ingrese el número de celular"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="border-gray-300 focus:border-primary focus:ring-primary transition-all duration-300"
              />
            </div>

            <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.4s" }}>
              <Label htmlFor="plaque" className="text-sm font-medium">
                Placa vehiculo cliente
              </Label>
              <Input
                id="plaque"
                placeholder="Ingrese la placa del vehiculo"
                value={plaque}
                onChange={(e) => setPlaque(e.target.value)}
                required
                className="border-gray-300 focus:border-primary focus:ring-primary transition-all duration-300"
              />
            </div>

          </div>

          <Button
            type="button"
            className={`w-full mt-6 transition-all duration-300 relative overflow-hidden ${isFormValid ? "text-white shadow-lg" : "text-gray-400 bg-gray-100"
              }`}
            disabled={loading || !isFormValid}
            onClick={handleConfirmation}
          >
            <span className="relative z-10">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin inline" />
                  Generando...
                </>
              ) : (
                "Generar enlace"
              )}
            </span>
            {isFormValid && <span className="absolute inset-0 rgb-button-vibrant"></span>}
          </Button>
        </form>

        {response && (
          <div className="mt-8 p-6 rounded-lg bg-white/80 backdrop-blur-sm border border-blue-100 shadow-lg animate-bounce-in">
            <h3 className="text-xl font-bold gradient-text mb-4 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Enlace generado con éxito
            </h3>
            <div className="space-y-4">
              <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
                <span className="font-medium text-gray-700">Enlace de pago:</span>
                <div className="mt-1 p-3 bg-blue-50 border border-blue-100 rounded-md break-all flex justify-between items-center group">
                  <a
                    href={response.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline truncate"
                  >
                    {response.link}
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 text-gray-500 hover:text-primary hover:bg-blue-50 transition-colors"
                    onClick={() => copyToClipboard(response.link)}
                  >
                    {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <span className="font-medium text-gray-700">EXTERNAL ID:</span>
                <div className="mt-1 p-3 bg-blue-50 border border-blue-100 rounded-md break-all flex justify-between items-center group">
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline truncate"
                  >
                    {response.cusId}
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 text-gray-500 hover:text-primary hover:bg-blue-50 transition-colors"
                    onClick={() => copyToClipboard2(response.cusId)}
                  >
                    {copiedEid ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
                  <span className="font-medium text-gray-700">Nombre completo:</span>
                  <div className="mt-1 p-3 bg-blue-50 border border-blue-100 rounded-md">{response.fullName}</div>
                </div>

                <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
                  <span className="font-medium text-gray-700">Correo electrónico:</span>
                  <div className="mt-1 p-3 bg-blue-50 border border-blue-100 rounded-md">{response.email}</div>
                </div>

                <div className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
                  <span className="font-medium text-gray-700">Monto:</span>
                  <div className="mt-1 p-3 bg-blue-50 border border-blue-100 rounded-md font-semibold">
                    $ {formatNumberToCOP2(response.amount)}
                  </div>
                </div>

                <div className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
                  <span className="font-medium text-gray-700">Documento:</span>
                  <div className="mt-1 p-3 bg-blue-50 border border-blue-100 rounded-md">{response.documentNumber}</div>
                </div>

                <div className="animate-slide-up" style={{ animationDelay: "0.6s" }}>
                  <span className="font-medium text-gray-700">Métodos de pago:</span>
                  <div className="mt-1 p-3 bg-blue-50 border border-blue-100 rounded-md">{response.paymentMethod}</div>
                </div>

                <div className="animate-slide-up" style={{ animationDelay: "0.6s" }}>
                  <span className="font-medium text-gray-700">Placa:</span>
                  <div className="mt-1 p-3 bg-blue-50 border border-blue-100 rounded-md">{response.plaque}</div>
                </div>


                <div className="animate-slide-up" style={{ animationDelay: "0.5s" }}>
                  <span className="font-medium text-gray-700">Fecha de creación:</span>
                  <div className="mt-1 p-3 bg-blue-50 border border-blue-100 rounded-md">{formatFechaHoraColombiana(response.date)}</div>
                </div>

                <div className="animate-slide-up" style={{ animationDelay: "0.6s" }}>
                  <span className="font-medium text-gray-700">Expira:</span>
                  <div className="mt-1 p-3 bg-blue-50 border border-blue-100 rounded-md">{formatFechaHoraColombiana(response.expirationDate)}</div>
                </div>

              </div>
            </div>

            {/* Marca de agua en la parte inferior del resultado con logo */}
            <div className="mt-6 flex justify-between items-center">
              <Image
                src="/images/bluelink_bpo_logo.png"
                alt="Bluelink BPO"
                width={100}
                height={36}
                className="h-auto opacity-70"
              />
              <span className="text-xs text-gray-400">
                Desarrollado por{" "}
                <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#23dce1] to-[#0057ff]">
                  jormanDEV
                </span>
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
