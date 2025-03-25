import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Voltar para o início
          </Link>
        </div>

        <Card className="max-w-4xl mx-auto bg-white shadow-lg">
          {/* Title Section */}
          <div className="border-b border-gray-200 bg-gray-50 rounded-t-lg">
            <div className="px-8 py-6">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Política de Privacidade</h1>
                <Button variant="outline" asChild>
                  <Link href="/legal/terms">
                    Ver Termos de Serviço
                  </Link>
                </Button>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Última atualização: {new Date().toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-6 space-y-8">
            <div className="prose prose-gray max-w-none">
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-semibold">1</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Coleta de Informações do Instagram</h2>
                </div>
                <div className="pl-11">
                  <p className="text-gray-600 mb-4">
                    Ao utilizar nosso serviço integrado com o Instagram, coletamos apenas as informações 
                    permitidas e necessárias de acordo com as políticas do Instagram:
                  </p>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <span className="w-2 h-2 mt-2 mr-2 bg-green-500 rounded-full flex-shrink-0" />
                      <span>Dados básicos do perfil público do Instagram</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 mt-2 mr-2 bg-green-500 rounded-full flex-shrink-0" />
                      <span>Mensagens enviadas diretamente para nossa plataforma</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 mt-2 mr-2 bg-green-500 rounded-full flex-shrink-0" />
                      <span>Informações de mídia compartilhada publicamente</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 mt-2 mr-2 bg-green-500 rounded-full flex-shrink-0" />
                      <span>Dados de interação autorizados pelo usuário</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-semibold">2</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Uso das Informações</h2>
                </div>
                <div className="pl-11">
                  <p className="text-gray-600 mb-4">
                    As informações coletadas são utilizadas em conformidade com as políticas do Instagram:
                  </p>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <span className="w-2 h-2 mt-2 mr-2 bg-green-500 rounded-full flex-shrink-0" />
                      <span>Gerenciamento de mensagens e interações</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 mt-2 mr-2 bg-green-500 rounded-full flex-shrink-0" />
                      <span>Análise de engajamento autorizado</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 mt-2 mr-2 bg-green-500 rounded-full flex-shrink-0" />
                      <span>Resposta a mensagens e comentários</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 mt-2 mr-2 bg-green-500 rounded-full flex-shrink-0" />
                      <span>Geração de relatórios de desempenho</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-semibold">3</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Proteção de Dados</h2>
                </div>
                <div className="pl-11">
                  <p className="text-gray-600 mb-4">
                    Implementamos medidas de segurança em conformidade com as diretrizes do Instagram:
                  </p>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <span className="w-2 h-2 mt-2 mr-2 bg-green-500 rounded-full flex-shrink-0" />
                      <span>Criptografia em todas as transmissões de dados</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 mt-2 mr-2 bg-green-500 rounded-full flex-shrink-0" />
                      <span>Armazenamento seguro de tokens de acesso</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 mt-2 mr-2 bg-green-500 rounded-full flex-shrink-0" />
                      <span>Acesso restrito aos dados conforme políticas do Instagram</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 mt-2 mr-2 bg-green-500 rounded-full flex-shrink-0" />
                      <span>Monitoramento contínuo de conformidade</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-semibold">4</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Seus Direitos</h2>
                </div>
                <div className="pl-11">
                  <p className="text-gray-600 mb-4">
                    Em conformidade com as políticas do Instagram, você tem direito a:
                  </p>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <span className="w-2 h-2 mt-2 mr-2 bg-green-500 rounded-full flex-shrink-0" />
                      <span>Revogar o acesso ao seu perfil do Instagram a qualquer momento</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 mt-2 mr-2 bg-green-500 rounded-full flex-shrink-0" />
                      <span>Solicitar a exclusão de dados coletados</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 mt-2 mr-2 bg-green-500 rounded-full flex-shrink-0" />
                      <span>Limitar o escopo de acesso aos seus dados</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 mt-2 mr-2 bg-green-500 rounded-full flex-shrink-0" />
                      <span>Solicitar relatório de dados armazenados</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-semibold">5</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Conformidade com o Instagram</h2>
                </div>
                <div className="pl-11">
                  <p className="text-gray-600 mb-4">
                    Nossa plataforma segue rigorosamente:
                  </p>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <span className="w-2 h-2 mt-2 mr-2 bg-green-500 rounded-full flex-shrink-0" />
                      <span>Políticas da Plataforma do Instagram</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 mt-2 mr-2 bg-green-500 rounded-full flex-shrink-0" />
                      <span>Diretrizes da API do Instagram</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 mt-2 mr-2 bg-green-500 rounded-full flex-shrink-0" />
                      <span>Termos de Uso do Instagram</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 mt-2 mr-2 bg-green-500 rounded-full flex-shrink-0" />
                      <span>Requisitos de Segurança e Privacidade Meta</span>
                    </li>
                  </ul>
                </div>
              </section>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <div className="px-8 py-4 text-sm text-gray-500">
              <p>
                Esta política de privacidade está em conformidade com as diretrizes do Instagram e está 
                sujeita a alterações conforme atualizações das políticas da plataforma. Recomendamos que 
                você revise periodicamente para estar ciente de quaisquer atualizações.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 