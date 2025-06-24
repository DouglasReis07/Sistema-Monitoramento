"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, History, Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react"

interface Command {
  id: string,
  command: string,
  status: "pending" | "sent" | "failed",
  sent_at: string,
  message_id?: string,
  error_message?: string
}

interface PredefinedCommand {
  command: string,
  description: string
}

interface CommandPanelProps {
  device: any,
  isOpen: boolean,
  onClose: () => void
}

const CommandPanel: React.FC<CommandPanelProps> = ({ device, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"send" | "history">("send")
  const [customCommand, setCustomCommand] = useState("")
  const [predefinedCommands, setPredefinedCommands] = useState<Record<string, PredefinedCommand>>({})
  const [commandHistory, setCommandHistory] = useState<Command[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastSentCommand, setLastSentCommand] = useState<any>(null)

  // Carregar comandos pré-definidos
  useEffect(() => {
    if (isOpen) {
      fetchPredefinedCommands()
      fetchCommandHistory()
    }
  }, [isOpen, device.device_key])

  const fetchPredefinedCommands = async () => {
    try {
      const response = await fetch("/api/commands/predefined", {
        headers: { "x-api-key": "123456789" },
      })
      const data = await response.json()
      setPredefinedCommands(data)
    } catch (error) {
      console.error("Erro ao carregar comandos pré-definidos:", error)
    }
  }

  const fetchCommandHistory = async () => {
    try {
      const response = await fetch(`/api/commands/history/${device.device_key}`, {
        headers: { "x-api-key": "123456789" },
      })
      const data = await response.json()
      setCommandHistory(data)
    } catch (error) {
      console.error("Erro ao carregar histórico:", error)
    }
  }

  const sendCommand = async (command: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/commands/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "123456789",
        },
        body: JSON.stringify({
          device_key: device.device_key,
          command: command,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setLastSentCommand(result)
        setCustomCommand("")
        fetchCommandHistory() // Atualizar histórico

        // Mostrar notificação de sucesso
        alert(`Comando enviado com sucesso!\nID: ${result.message_id}`)
      } else {
        alert(`Erro ao enviar comando: ${result.error}`)
      }
    } catch (error) {
      alert(`Erro de conexão: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return <RefreshCw className="w-4 h-4 text-gray-500" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR")
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-blue-600 text-white p-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Comandos do Dispositivo</h2>
                <p className="text-blue-100 text-sm">
                  {device.config?.name} - {device.device_key}
                </p>
              </div>
              <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl">
                ×
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            <button
              className={`flex-1 py-3 px-4 text-center font-medium ${
                activeTab === "send" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("send")}
            >
              <Send className="w-4 h-4 inline mr-2" />
              Enviar Comando
            </button>
            <button
              className={`flex-1 py-3 px-4 text-center font-medium ${
                activeTab === "history"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("history")}
            >
              <History className="w-4 h-4 inline mr-2" />
              Histórico ({commandHistory.length})
            </button>
          </div>

          {/* Content */}
          <div className="p-4 max-h-96 overflow-y-auto">
            {activeTab === "send" && (
              <div className="space-y-4">
                {/* Comandos Pré-definidos */}
                <div>
                  <h3 className="font-semibold mb-3">Comandos Pré-definidos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.entries(predefinedCommands).map(([key, cmd]) => (
                      <button
                        key={key}
                        onClick={() => sendCommand(cmd.command)}
                        disabled={isLoading}
                        className="p-3 text-left border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="font-medium text-sm">{cmd.command}</div>
                        <div className="text-xs text-gray-500">{cmd.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comando Personalizado */}
                <div>
                  <h3 className="font-semibold mb-3">Comando Personalizado</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customCommand}
                      onChange={(e) => setCustomCommand(e.target.value)}
                      placeholder="Digite o comando (ex: LOCATE#)"
                      className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                    <button
                      onClick={() => sendCommand(customCommand)}
                      disabled={!customCommand.trim() || isLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Enviar
                    </button>
                  </div>
                </div>

                {/* Último Comando Enviado */}
                {lastSentCommand && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <h4 className="font-medium text-green-800 mb-1">Último comando enviado</h4>
                    <p className="text-sm text-green-700">ID da Mensagem: {lastSentCommand.message_id}</p>
                    <p className="text-sm text-green-600">Dispositivo: {lastSentCommand.device_name}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "history" && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Histórico de Comandos</h3>
                  <button
                    onClick={fetchCommandHistory}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Atualizar
                  </button>
                </div>

                {commandHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Nenhum comando enviado ainda</div>
                ) : (
                  <div className="space-y-2">
                    {commandHistory.map((cmd) => (
                      <div key={cmd.id} className="border rounded-lg p-3 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getStatusIcon(cmd.status)}
                              <span className="font-medium">{cmd.command}</span>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  cmd.status === "sent"
                                    ? "bg-green-100 text-green-800"
                                    : cmd.status === "failed"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {cmd.status}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">{formatDate(cmd.sent_at)}</div>
                            {cmd.message_id && <div className="text-xs text-gray-400">ID: {cmd.message_id}</div>}
                            {cmd.error_message && (
                              <div className="text-xs text-red-600 mt-1">Erro: {cmd.error_message}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default CommandPanel
