"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Search, AlertCircle } from "lucide-react"
import TransactionModal from "./transaction-modal"

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
  cellphoneNumber: string      // nuevo campo agregado
  address: string              // nuevo campo agregado
}

interface TransactionStatusProps {
  linkImage: string;
}

export default function TransactionStatus({ linkImage }: TransactionStatusProps) {
  const [cusId, setCusId] = useState("")
  const [loading, setLoading] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [response, setResponse] = useState<TransactionStatusResponse | null>(null)
  const [error, setError] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isFormValid, setIsFormValid] = useState(false)

  const SUPERPAY_USERNAME = process.env.SUPERPAY_USERNAME;
  const SUPERPAY_PASSWORD = process.env.SUPERPAY_PASSWORD;
  const SUPERPAY_TERMINAL_ID = process.env.SUPERPAY_TERMINAL_ID;

  // Añadir este useEffect para validar el formulario
  useEffect(() => {
    if (cusId.trim() !== "") {
      setIsFormValid(true)
    } else {
      setIsFormValid(false)
    }
  }, [cusId])

  const fetchTransactionStatus = async (externalId: string): Promise<TransactionStatusResponse> => {
    if (!externalId.trim()) {
      throw new Error("Por favor ingrese un CUS ID válido");
    }

    const loginUrl = "https://sbx.superpay.com.co/api/router-bck/terminals/login";
    const inquiryUrl = "https://sbx.superpay.com.co/api/router-bck/transactions/transaction-by-external-id";

    const credentials = {
      userName: process.env.NEXT_PUBLIC_SUPERPAY_USER,
      password: process.env.NEXT_PUBLIC_SUPERPAY_PASS,
      terminalId: process.env.NEXT_PUBLIC_SUPERPAY_TERMINAL_ID,
    };

    try {
      // Paso 1: LOGIN
      const loginResponse = await fetch(loginUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!loginResponse.ok) {
        throw new Error("Error en el login con SuperPay:");
      }

      const loginData = await loginResponse.json();
      const apiToken = loginData.apiToken;

      if (!apiToken) {
        throw new Error("Token de autenticación no recibido");
      }

      // Paso 2: Consultar transacción
      const trxBody = {
        originalExternalId: externalId,
        apiToken,
        terminalId: credentials.terminalId,
      };

      const trxResponse = await fetch(inquiryUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trxBody),
      });

      if (!trxResponse.ok) {
        throw new Error("Error al consultar la transacción");
      }

      const trxData = await trxResponse.json();

      // Paso 3: Procesar extraJsonData10
      const extraData = trxData.extraJsonData10
        ? JSON.parse(trxData.extraJsonData10)
        : {};

      // Paso 4: Traducir estado
      const statusMap: Record<string, string> = {
        APPROVED: "Aprobada",
        PENDING: "Pendiente",
        DECLINED: "Rechazada/Fallida",
      };

      const formattedData: TransactionStatusResponse = {
        cusId: externalId,
        status: statusMap[trxData.trxStatus],
        amount: `S/ ${parseFloat(trxData.authAmount || "0").toFixed(2)}`,
        paymentDate: trxData.dtRequest,
        customerName: extraData.fullName,
        customerLastName: "", // podrías separar aquí si quieres
        customerEmail: extraData.email,
        documentNumber: extraData.identificationNumber,
        paymentMethod: trxData.paymentDescription,
        transactionReference: trxData.externalId,
        bankName: trxData.bankInfo,
        cardLastDigits: trxData.extraData1,
        cellphoneNumber: extraData.cellphoneNumber,
        address: extraData.address,
      };

      return formattedData;
    } catch (error: any) {
      console.error("Error al consultar el estado de la transacción:", error);
      throw new Error(error.message || "Ocurrió un error inesperado");
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setIsModalOpen(false); // Asegurarse de que el modal esté cerrado antes de empezar

    try {
      const responseData = await fetchTransactionStatus(cusId); // usa el externalId ingresado
      setResponse(responseData); // este objeto lo usará el modal
      setIsModalOpen(true); // Solo se abre el modal si todo fue exitoso
    } catch (error) {
      console.error("Error al consultar estado:", error);
      setError(error instanceof Error ? error.message : "Error al consultar estado");
      setResponse(null);
    } finally {
      setLoading(false);
    }
  };



  const handleUpdateStatus = async () => {
    if (!response) return;

    setUpdatingStatus(true);
    try {
      const updatedData = await fetchTransactionStatus(response.cusId); // reutiliza el ID actual
      setResponse(updatedData);
    } catch (error) {
      console.error("Error al actualizar estado:", error);
    } finally {
      setUpdatingStatus(false);
    }
  };


  return (
    <Card className="shadow-lg border-0 gradient-border card-hover overflow-hidden relative">
      <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-lg z-0"></div>

      {/* Marca de agua en la esquina superior derecha */}
      <div className="absolute top-3 right-3 text-xs font-medium text-gray-300 opacity-30 z-10">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0057ff] to-[#23dce1]">jormanDEV</span>
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
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold gradient-text">Consultar estado de transacción</CardTitle>
        </div>
        <CardDescription className="text-gray-600">
          Ingrese el External ID para verificar el estado de la transacción
        </CardDescription>
      </CardHeader>
      <CardContent className="relative z-10">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 animate-slide-up">
            <Label htmlFor="cusId" className="text-sm font-medium">
              External ID
            </Label>
            <div className="relative">
              <Input
                id="cusId"
                placeholder="Ingrese el External ID"
                value={cusId}
                onChange={(e) => setCusId(e.target.value)}
                required
                className="pl-10 border-gray-300 focus:border-primary focus:ring-primary transition-all duration-300"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className={`w-full mt-6 transition-all duration-300 relative overflow-hidden ${isFormValid ? "text-white shadow-lg" : "text-gray-400 bg-gray-100"
              }`}
            disabled={loading || !isFormValid}
          >
            <span className="relative z-10">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin inline" />
                  Consultando...
                </>
              ) : (
                "Consultar estado"
              )}
            </span>
            {isFormValid && <span className="absolute inset-0 rgb-button-vibrant"></span>}
          </Button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md flex items-center animate-slide-up">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Usar el componente de modal separado */}
        {response && (
          <TransactionModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            data={response}
            onUpdate={handleUpdateStatus}
            isUpdating={updatingStatus}
            linkImage={`${linkImage}`}
          />
        )}
      </CardContent>
    </Card>
  )
}
