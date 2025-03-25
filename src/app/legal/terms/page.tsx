import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function TermsOfServicePage() {
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
                <h1 className="text-3xl font-bold text-gray-900">Termos de Serviço</h1>
                <Button variant="outline" asChild>
                  <Link href="/legal/privacy">
                    Ver Política de Privacidade
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
                  <h2 className="text-2xl font-semibold text-gray-900">Aceitação dos Termos</h2>
                </div>
                <div className="pl-11">
                  <p className="text-gray-600">
                    Ao utilizar nosso serviço integrado com o Instagram, você concorda com estes termos de serviço,
                    nossa política de privacidade e as políticas do Instagram. O uso continuado do serviço após
                    alterações nos termos implica na aceitação das modificações. Você também concorda em cumprir
                    todas as diretrizes da plataforma Meta e do Instagram.
                  </p>
                </div>
              </section>

              <section className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-semibold">2</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Uso do Serviço</h2>
                </div>
                <div className="pl-11">
                  <p className="text-gray-600 mb-4">
                    Em conformidade com as políticas do Instagram, você se compromete a:
                  </p>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <span className="w-2 h-2 mt-2 mr-2 bg-green-500 rounded-full flex-shrink-0" />
                      <span>Não utilizar bots ou automação não autorizada</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 mt-2 mr-2 bg-green-500 rounded-full flex-shrink-0" />
                      <span>Não coletar dados de usuários sem autorização explícita</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 mt-2 mr-2 bg-green-500 rounded-full flex-shrink-0" />
                      <span>Respeitar os limites de taxa da API do Instagram</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 mt-2 mr-2 bg-green-500 rounded-full flex-shrink-0" />
                      <span>Não vender ou transferir dados do Instagram</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 mt-2 mr-2 bg-green-500 rounded-full flex-shrink-0" />
                      <span>Manter a segurança das credenciais de acesso</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 mt-2 mr-2 bg-green-500 rounded-full flex-shrink-0" />
                      <span>Não violar direitos de propriedade intelectual</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-semibold">3</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Limitações da API</h2>
                </div>
                <div className="pl-11">
                  <p className="text-gray-600 mb-4">
                    Nosso serviço está sujeito às seguintes limitações:
                  </p>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <span className="w-2 h-2 mt-2 mr-2 bg-green-500 rounded-full flex-shrink-0" />
                      <span>Limites de taxa impostos pela API do Instagram</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 mt-2 mr-2 bg-green-500 rounded-full flex-shrink-0" />
                      <span>Restrições de funcionalidades conforme políticas do Instagram</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 mt-2 mr-2 bg-green-500 rounded-full flex-shrink-0" />
                      <span>Acesso apenas a dados públicos ou explicitamente autorizados</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 mt-2 mr-2 bg-green-500 rounded-full flex-shrink-0" />
                      <span>Limitações de armazenamento de dados conforme diretrizes Meta</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-semibold">4</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Modificações e Atualizações</h2>
                </div>
                <div className="pl-11">
                  <p className="text-gray-600">
                    Nosso serviço está sujeito a alterações conforme atualizações das políticas do Instagram.
                    Reservamos o direito de modificar ou descontinuar funcionalidades para manter a conformidade
                    com as diretrizes da plataforma. Alterações significativas serão comunicadas aos usuários
                    com antecedência sempre que possível.
                  </p>
                </div>
              </section>

              <section className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-semibold">5</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Rescisão</h2>
                </div>
                <div className="pl-11">
                  <p className="text-gray-600">
                    Podemos encerrar ou suspender seu acesso ao serviço imediatamente se:
                  </p>
                  <ul className="space-y-3 text-gray-600 mt-4">
                    <li className="flex items-start">
                      <span className="w-2 h-2 mt-2 mr-2 bg-green-500 rounded-full flex-shrink-0" />
                      <span>Você violar estes Termos de Serviço</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 mt-2 mr-2 bg-green-500 rounded-full flex-shrink-0" />
                      <span>Você infringir as políticas do Instagram</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 mt-2 mr-2 bg-green-500 rounded-full flex-shrink-0" />
                      <span>Seu acesso ao Instagram for revogado</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 mt-2 mr-2 bg-green-500 rounded-full flex-shrink-0" />
                      <span>Por solicitação do Instagram ou Meta</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-semibold">6</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Conformidade Legal</h2>
                </div>
                <div className="pl-11">
                  <p className="text-gray-600">
                    Estes termos serão regidos e interpretados de acordo com as leis do Brasil e as políticas
                    do Instagram. Em caso de conflito entre estes termos e as políticas do Instagram, as
                    políticas do Instagram prevalecerão.
                  </p>
                </div>
              </section>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <div className="px-8 py-4 text-sm text-gray-500">
              <p>
                Estes termos de serviço estão em conformidade com as diretrizes do Instagram e estão
                sujeitos a alterações conforme atualizações das políticas da plataforma. Recomendamos que
                você revise periodicamente para estar ciente de quaisquer atualizações.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 