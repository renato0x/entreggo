# Regras operacionais iniciais

Estas regras são hipóteses operacionais, não requisitos técnicos finais. Elas devem ser testadas em campo e revisadas no registro de decisões.

## Afiliados

- Entregadores entram por cadastro e aprovação manual.
- Cada entregador informa os bairros em que deseja atuar e seu estado de disponibilidade.
- A operação pode suspender um afiliado em caso de documentação irregular ou incidentes recorrentes.

## Oferta de entrega

- Uma corrida só é oferecida a entregadores disponíveis dentro do território configurado.
- No início, a oferta pode ser enviada simultaneamente a todos os elegíveis; o primeiro aceite válido fica com a corrida.
- O comércio vê que a busca está em andamento, mas não dados pessoais desnecessários de outros entregadores.

## Estados de uma corrida

```text
RASCUNHO → ABERTA → ACEITA → EM_COLETA → EM_ENTREGA → CONCLUÍDA
                       ↘ CANCELADA
```

Cada transição deve registrar data, responsável e motivo quando aplicável.

## Sem aceite

- Após um prazo a definir, o comércio é avisado de que não há entregador confirmado.
- A operação pode reofertar a corrida, alterar as condições com autorização do comércio ou cancelá-la.

## Confirmação de entrega

- No MVP, a confirmação é um código informado pelo destinatário ou confirmação explícita do comércio.
- Entrega sem confirmação entra em exceção e exige análise pela operação.

## Dados e suporte

- Coletar somente os dados necessários para executar a entrega.
- Exibir dados de contato apenas durante a corrida e para as partes necessárias.
- Todo cancelamento ou incidente deve ter um canal de suporte e histórico operacional.
