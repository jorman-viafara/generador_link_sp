"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, X } from "lucide-react"
import Image from "next/image"
import { createPortal } from "react-dom"

interface TransactionStatusResponse {
  cusId: string
  status: string
  amount: string
  paymentDate: string
  customerName: string
  customerLastName: string
  customerEmail: string
  documentNumber: string
  paymentMethod: string
  transactionReference: string
  bankName: string
  cardLastDigits: string
  cellphoneNumber: string
  address: string
  placa: string
}

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  data: TransactionStatusResponse
  onUpdate: () => void
  isUpdating: boolean
  linkImage: string;
}



export default function TransactionModal({ isOpen, onClose, data, onUpdate, isUpdating, linkImage }: TransactionModalProps) {
  const [mounted, setMounted] = React.useState(false)

  const formatCurrency = (value: unknown): string => {
    if (typeof value === "string") {
      // Limpiar espacios, signos de moneda, comas innecesarias, etc.
      value = value.replace(/[^\d.-]/g, "");
    }

    const numericValue = Number(value);

    if (isNaN(numericValue)) return "0,00";

    return new Intl.NumberFormat("es-PE", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue);
  };




  React.useEffect(() => {
    setMounted(true)

    // Bloquear el scroll del body cuando el modal está abierto
    if (isOpen) {
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  if (!isOpen || !mounted) return null

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-black bg-opacity-50"
      onClick={onClose}
      style={{ backdropFilter: "blur(4px)" }}
    >
      <div className="flex min-h-full items-center justify-center p-4 text-center" onClick={(e) => e.stopPropagation()}>
        <div
          className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Botón de cerrar */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>

          {/* Logo de Bluelink BPO en el modal */}
          <div className="flex justify-center items-center gap-x-4 mb-4">
            <Image src={`${linkImage}/images/bluelink_bpo_logo.png`} alt="Bluelink BPO" width={80} height={30} className="h-auto mb-4" /> 

            
            <Image
              src={`${linkImage}/images/superpay.png`}
              alt="Superpay"
              width={30}
              height={30}
              className="h-auto mb-4"
            />
          </div>

          {/* Contenido del modal */}
          <div>
            <div className="flex justify-center items-center gap-x-4 mb-4">
              <h2 className="text-2xl font-bold gradient-text flex items-center">
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
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                </svg>
                Información de la transacción
              </h2>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-white border border-blue-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Detalles de la transacción </h3>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${data.status === "Aprobada"
                    ? "bg-green-100 text-green-800"
                    : data.status === "Pendiente"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                    }`}
                >
                  {data.status}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">EXTERNAL ID</div>
                  <div className="p-3 bg-white border border-gray-100 rounded-md font-mono text-primary">
                    {data.cusId}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 mb-1">Monto</div>
                  <div className="p-3 bg-white border border-gray-100 rounded-md font-bold text-gray-800">
                    {formatCurrency(data.amount)}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 mb-1">Nombres</div>
                  <div className="p-3 bg-white border border-gray-100 rounded-md">{data.customerName}</div>
                </div>

                {/* Si no usas customerLastName, puedes comentarlo o quitarlo */}
                {/* <div>
  <div className="text-sm text-gray-500 mb-1">Apellidos</div>
  <div className="p-3 bg-white border border-gray-100 rounded-md">{data.customerLastName}</div>
</div> */}

                <div>
                  <div className="text-sm text-gray-500 mb-1">Correo electrónico</div>
                  <div className="p-3 bg-white border border-gray-100 rounded-md">{data.customerEmail}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 mb-1">Documento</div>
                  <div className="p-3 bg-white border border-gray-100 rounded-md">{data.documentNumber}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 mb-1">Celular</div>
                  <div className="p-3 bg-white border border-gray-100 rounded-md">{data.cellphoneNumber}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 mb-1">Dirección</div>
                  <div className="p-3 bg-white border border-gray-100 rounded-md">{data.address}</div>
                </div>

                {data.status === "Aprobada" && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Fecha de pago</div>
                    <div className="p-3 bg-white border border-gray-100 rounded-md">
                      {data.paymentDate}
                    </div>
                  </div>
                )}



                <div>
                  <div className="text-sm text-gray-500 mb-1">Método de pago</div>
                  <div className="p-3 bg-white border border-gray-100 rounded-md">PSE</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 mb-1">Descripcion</div>
                  <div className="p-3 bg-white border border-gray-100 rounded-md">{data.paymentMethod}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 mb-1">Placa</div>
                  <div className="p-3 bg-white border border-gray-100 rounded-md font-mono text-xs">
                    {data.placa}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 mb-1">Banco</div>
                  <div className="p-3 bg-white border border-gray-100 rounded-md">{data.bankName}</div>
                </div>

                {data.paymentMethod === "Tarjeta de crédito" && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Últimos dígitos</div>
                    <div className="p-3 bg-white border border-gray-100 rounded-md">
                      **** **** **** {data.cardLastDigits}
                    </div>
                  </div>
                )}

              </div>

              <div className="mt-6 flex justify-end space-x-3">
                {/*<Button
                  className="relative overflow-hidden text-white shadow-lg"
                  onClick={onUpdate}
                  disabled={isUpdating}
                >
                  <span className="relative z-10">
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 inline" />
                        Actualizar
                      </>
                    )}
                  </span>
                  <span className="absolute inset-0 rgb-button-vibrant"></span>
                </Button>*/}
                <Button className="relative overflow-hidden text-white shadow-lg" onClick={onClose}>
                  <span className="relative z-10">Cerrar</span>
                  <span className="absolute inset-0 rgb-button-vibrant"></span>
                </Button>
              </div>
            </div>

            {/* Marca de agua en el modal */}
            <div className="mt-4 text-right text-xs font-medium text-gray-300 opacity-30">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#23dce1] to-[#0057ff]">
                jsvrDEV
              </span>
              <span className="mx-1">|</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0057ff] to-[#23dce1]">
                jormanDEV
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Usar createPortal para renderizar el modal fuera del árbol DOM normal
  return createPortal(modalContent, document.body)
}
