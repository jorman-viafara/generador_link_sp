import PaymentLinkGenerator from "@/components/payment-link-generator"
import TransactionStatus from "@/components/transaction-status"
import Image from "next/image"
import getConfig from 'next/config';

export default function Home() {
  const { basePath } = getConfig().publicRuntimeConfig || { basePath: '' };
  const { publicRuntimeConfig } = getConfig();
  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Logo y título */}
        <div className="text-center animate-fade-in">
          <div className="flex justify-center mb-4">
            <Image src={`${publicRuntimeConfig.basePath}/images/bluelink_bpo_logo.png`} alt="Bluelink BPO" width={220} height={80} className="h-auto" />
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Genera enlaces de pago SuperPay y consulta el estado de las transacciones de forma rápida y segura
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-1">
          <div className="animate-slide-up">
          <PaymentLinkGenerator linkImage={`${publicRuntimeConfig.basePath}/images/bluelink_bpo_logo.png`} />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
           <TransactionStatus linkImage={`${publicRuntimeConfig.basePath}/images/bluelink_bpo_logo.png`}/>
          </div>
        </div>

        {/* Footer con marcas de agua y logo */}
        <div className="mt-12 text-center">
          <div className="flex flex-col items-center space-y-4">
            <Image
              src={`${publicRuntimeConfig.basePath}/images/bluelink_bpo_logo.png`}
              alt="Bluelink BPO"
              width={150}
              height={55}
              className="h-auto opacity-90"
            />
            <div className="flex justify-center items-center space-x-6 mt-2">
              <div className="text-transparent bg-clip-text bg-gradient-to-r from-[#23dce1] to-[#0057ff] font-bold text-lg">
                jsvrDEV
              </div>
              <div className="h-6 w-px bg-gradient-to-b from-[#23dce1] to-[#0057ff]"></div>
              <div className="text-transparent bg-clip-text bg-gradient-to-r from-[#0057ff] to-[#23dce1] font-bold text-lg">
                jormanDEV
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Bluelink BPO. Todos los derechos reservados
            </p>
          </div>
        </div>
      </div>

      {/* Marcas de agua en las esquinas */}
      <div className="fixed top-4 left-4 text-xs font-medium text-gray-300 opacity-50 rotate-[-15deg]">jsvrDEV</div>
      <div className="fixed bottom-4 right-4 text-xs font-medium text-gray-300 opacity-50 rotate-[15deg]">
        jormanDEV
      </div>
    </main>
  )
}
