"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Terminal, MapPin, Clock, Smartphone } from "lucide-react"
import CommandPanel from "./CommandPanel"

const DeviceInfoCard = ({ device, address, onClose }) => {
  const [showCommandPanel, setShowCommandPanel] = useState(false)

  const getLocationTypeIcon = () => {
    if (device.status?.lat !== 0 && device.status?.lng !== 0) {
      return <MapPin className="w-4 h-4 text-green-500" />
    } else if (device.lbs_position?.lat) {
      return <Smartphone className="w-4 h-4 text-blue-500" />
    }
    return <Clock className="w-4 h-4 text-gray-500" />
  }

  const getLocationTypeText = () => {
    if (device.status?.lat !== 0 && device.status?.lng !== 0) {
      return "GPS"
    } else if (device.lbs_position?.lat) {
      return "LBS"
    }
    return "Desconhecido"
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="device-info-card bg-white rounded-lg shadow-lg border max-w-md"
      >
        <div className="card-header bg-blue-600 text-white p-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Informações do Dispositivo</h3>
            <button onClick={onClose} className="text-white hover:text-gray-200 text-xl font-bold">
              ✕
            </button>
          </div>
        </div>

        <div className="card-content p-4 space-y-3">
          <div className="info-row flex justify-between items-center py-2 border-b border-gray-100">
            <strong className="text-gray-700">Chave Natural:</strong>
            <span className="text-gray-900 font-medium">{device.config?.name || "N/A"}</span>
          </div>

          <div className="info-row flex justify-between items-center py-2 border-b border-gray-100">
            <strong className="text-gray-700">Email:</strong>
            <span className="text-gray-900 text-sm">{device.email || "N/A"}</span>
          </div>

          <div className="info-row flex justify-between items-center py-2 border-b border-gray-100">
            <strong className="text-gray-700">Chave do Dispositivo:</strong>
            <span className="text-gray-900 text-sm font-mono">{device.device_key || "N/A"}</span>
          </div>

          <div className="info-row flex justify-between items-center py-2 border-b border-gray-100">
            <strong className="text-gray-700">IMEI:</strong>
            <span className="text-gray-900 text-sm font-mono">{device.imei || "N/A"}</span>
          </div>

          <div className="info-row flex justify-between items-center py-2 border-b border-gray-100">
            <strong className="text-gray-700">Modelo:</strong>
            <span className="text-gray-900">{device.model || "N/A"}</span>
          </div>

          <div className="info-row py-2 border-b border-gray-100">
            <strong className="text-gray-700 block mb-1">Endereço:</strong>
            <span className="text-gray-900 text-sm">{address || "Buscando endereço..."}</span>
          </div>

          <div className="info-row flex justify-between items-center py-2 border-b border-gray-100">
            <strong className="text-gray-700">Última Atualização:</strong>
            <span className="text-gray-900 text-sm">
              {device.status?.location_date ? new Date(device.status.location_date).toLocaleString("pt-BR") : "N/A"}
            </span>
          </div>

          <div className="info-row flex justify-between items-center py-2">
            <strong className="text-gray-700">Tipo de Localização:</strong>
            <div className="flex items-center gap-2">
              {getLocationTypeIcon()}
              <span className="text-gray-900">{getLocationTypeText()}</span>
            </div>
          </div>
        </div>

        {/* Botão de Comandos */}
        <div className="card-footer p-4 bg-gray-50 rounded-b-lg">
          <button
            onClick={() => setShowCommandPanel(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Terminal className="w-4 h-4" />
            Enviar Comandos
          </button>
        </div>
      </motion.div>

      {/* Command Panel */}
      <CommandPanel device={device} isOpen={showCommandPanel} onClose={() => setShowCommandPanel(false)} />
    </>
  )
}

export default DeviceInfoCard
