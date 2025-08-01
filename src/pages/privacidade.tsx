import React from "react";

const PoliticaPrivacidade = () => {
  return (
    <main className="min-h-screen py-20 px-6 lg:px-12 bg-offwhite-leve text-gray-800">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold font-atteron mb-8 text-lilas-mistico">
          Política de Privacidade
        </h1>

        <p className="mb-6 font-montserrat leading-relaxed text-lg">
          Esta página explica como coletamos, usamos e protegemos suas
          informações pessoais quando você utiliza este site.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">
          1. Coleta de Informações
        </h2>
        <p className="mb-4">
          Utilizamos ferramentas como o Google Analytics para entender como
          visitantes navegam em nosso site. Essas ferramentas coletam dados
          como localização aproximada, páginas visitadas, tempo de permanência
          e tipo de dispositivo. Nenhum dado sensível ou identificador pessoal
          direto (como nome ou e-mail) é coletado automaticamente.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">
          2. Uso das Informações
        </h2>
        <p className="mb-4">
          Os dados coletados são usados exclusivamente para fins estatísticos
          e para melhorar sua experiência no site. Não vendemos, trocamos ou
          compartilhamos suas informações com terceiros para fins comerciais.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">
          3. Cookies
        </h2>
        <p className="mb-4">
          Utilizamos cookies para armazenar preferências do usuário e coletar
          informações anônimas de navegação. Você pode desativar os cookies nas
          configurações do seu navegador.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">
          4. Consentimento
        </h2>
        <p className="mb-4">
          Ao continuar navegando em nosso site, você consente com a coleta e
          uso das informações conforme descrito nesta política.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">
          5. Seus Direitos
        </h2>
        <p className="mb-4">
          Você pode, a qualquer momento, solicitar a exclusão de dados
          relacionados à sua navegação ou obter mais informações entrando em
          contato conosco.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">
          6. Alterações nesta Política
        </h2>
        <p className="mb-4">
          Esta política pode ser atualizada ocasionalmente. Recomendamos que
          você a consulte regularmente.
        </p>

        <p className="text-sm text-gray-500 mt-12 italic">
          Última atualização: Agosto de 2025
        </p>
      </div>
    </main>
  );
};

export default PoliticaPrivacidade;
