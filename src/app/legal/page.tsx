import { Card } from "@/components/ui/card";

export default function LegalPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card className="p-8">
        <h1 className="text-3xl font-bold mb-6">Política de Privacidade</h1>
        
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Coleta de Informações</h2>
            <p className="text-gray-700">
              Ao utilizar nosso serviço de integração com WhatsApp, coletamos apenas as informações necessárias para o funcionamento do serviço:
            </p>
            <ul className="list-disc ml-6 mt-2 text-gray-700">
              <li>Dados de autenticação do WhatsApp</li>
              <li>Mensagens enviadas e recebidas através da plataforma</li>
              <li>Informações de contatos necessárias para a comunicação</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Uso das Informações</h2>
            <p className="text-gray-700">
              As informações coletadas são utilizadas exclusivamente para:
            </p>
            <ul className="list-disc ml-6 mt-2 text-gray-700">
              <li>Estabelecer a conexão com o WhatsApp</li>
              <li>Processar e entregar mensagens</li>
              <li>Manter o histórico de conversas</li>
              <li>Melhorar a experiência do usuário</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Proteção de Dados</h2>
            <p className="text-gray-700">
              Implementamos medidas de segurança para proteger suas informações:
            </p>
            <ul className="list-disc ml-6 mt-2 text-gray-700">
              <li>Criptografia de ponta a ponta nas mensagens</li>
              <li>Armazenamento seguro de credenciais</li>
              <li>Acesso restrito aos dados</li>
            </ul>
          </section>
        </div>
      </Card>

      <Card className="p-8">
        <h1 className="text-3xl font-bold mb-6">Termos de Serviço</h1>
        
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Aceitação dos Termos</h2>
            <p className="text-gray-700">
              Ao utilizar nosso serviço, você concorda com estes termos de serviço e nossa política de privacidade.
              O uso continuado do serviço após alterações nos termos implica na aceitação das modificações.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Uso do Serviço</h2>
            <p className="text-gray-700">
              O usuário se compromete a:
            </p>
            <ul className="list-disc ml-6 mt-2 text-gray-700">
              <li>Não utilizar o serviço para fins ilegais</li>
              <li>Não enviar spam ou conteúdo malicioso</li>
              <li>Respeitar os termos de uso do WhatsApp</li>
              <li>Manter suas credenciais seguras</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Limitação de Responsabilidade</h2>
            <p className="text-gray-700">
              Não nos responsabilizamos por:
            </p>
            <ul className="list-disc ml-6 mt-2 text-gray-700">
              <li>Interrupções no serviço do WhatsApp</li>
              <li>Perda de dados devido a fatores externos</li>
              <li>Uso indevido da plataforma</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Modificações no Serviço</h2>
            <p className="text-gray-700">
              Reservamos o direito de modificar ou descontinuar o serviço a qualquer momento,
              com ou sem aviso prévio. Não nos responsabilizamos perante você ou terceiros por
              qualquer modificação, suspensão ou descontinuação do serviço.
            </p>
          </section>
        </div>
      </Card>
    </div>
  );
} 