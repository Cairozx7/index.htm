"use strict";
 
const CHAVE = "mural-estagios:vagas";
 
const form = document.getElementById("form-vaga");
const corpo = document.getElementById("tabela-vagas");
const vazio = document.getElementById("vazio");
const total = document.getElementById("total");
const busca = document.getElementById("busca");
 
const obrigatorios = {
  empresa: "Informe o nome da empresa.",
  cargo: "Informe o nome da vaga.",
  area: "Selecione a área.",
  modalidade: "Selecione a modalidade.",
  cidade: "Informe a cidade.",
  contato: "Informe um e-mail válido.",
};
 
/* ---------- Armazenamento ---------- */
 
function carregar() {
  try {
    const salvo = localStorage.getItem(CHAVE);
    if (salvo === null) {
      const exemplos = [
        { id: 1, empresa: "Tech Norte", cargo: "Estágio em Suporte de TI", area: "Tecnologia", modalidade: "Híbrido", cidade: "Fortaleza", bolsa: 1300, contato: "rh@technorte.com", descricao: "Atendimento a chamados e manutenção de equipamentos." },
        { id: 2, empresa: "Studio Alvo", cargo: "Estágio em Marketing Digital", area: "Marketing", modalidade: "Remoto", cidade: "Remoto", bolsa: 1100, contato: "vagas@studioalvo.com", descricao: "Apoio na criação de conteúdo e métricas de redes sociais." },
      ];
      salvar(exemplos);
      return exemplos;
    }
    return JSON.parse(salvo);
  } catch (e) {
    return [];
  }
}
 
function salvar(lista) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(lista));
  } catch (e) {
    /* sem armazenamento: a lista vale apenas durante a visita */
  }
}
 
let vagas = carregar();
 
/* ---------- Tabela ---------- */
 
function celula(texto, classe) {
  const td = document.createElement("td");
  td.textContent = texto;
  if (classe) td.className = classe;
  return td;
}
 
function formatarBolsa(valor) {
  if (!valor) return "A combinar";
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
 
function linha(vaga) {
  const tr = document.createElement("tr");
 
  tr.appendChild(celula(vaga.empresa));
 
  const tdCargo = document.createElement("td");
  tdCargo.className = "cargo";
  const nome = document.createElement("strong");
  nome.textContent = vaga.cargo;
  tdCargo.appendChild(nome);
  if (vaga.descricao) {
    const desc = document.createElement("small");
    desc.textContent = vaga.descricao;
    tdCargo.appendChild(desc);
  }
  tr.appendChild(tdCargo);
 
  tr.appendChild(celula(vaga.area));
 
  const tdMod = document.createElement("td");
  const selo = document.createElement("span");
  selo.className = "selo";
  selo.textContent = vaga.modalidade;
  tdMod.appendChild(selo);
  tr.appendChild(tdMod);
 
  tr.appendChild(celula(vaga.cidade));
  tr.appendChild(celula(formatarBolsa(vaga.bolsa)));
 
  const tdContato = document.createElement("td");
  const link = document.createElement("a");
  link.href = "mailto:" + vaga.contato;
  link.textContent = vaga.contato;
  tdContato.appendChild(link);
  tr.appendChild(tdContato);
 
  const tdAcao = document.createElement("td");
  const botao = document.createElement("button");
  botao.type = "button";
  botao.className = "remover";
  botao.textContent = "Remover";
  botao.setAttribute("aria-label", "Remover vaga " + vaga.cargo);
  botao.addEventListener("click", () => remover(vaga.id));
  tdAcao.appendChild(botao);
  tr.appendChild(tdAcao);
 
  return tr;
}
 
function renderizar() {
  const termo = busca.value.trim().toLowerCase();
  const filtradas = vagas.filter((v) =>
    [v.empresa, v.cargo, v.cidade, v.area].some((campo) => campo.toLowerCase().includes(termo))
  );
 
  corpo.replaceChildren(...filtradas.map(linha));
  vazio.hidden = filtradas.length > 0;
  total.textContent = vagas.length;
}
 
function remover(id) {
  vagas = vagas.filter((v) => v.id !== id);
  salvar(vagas);
  renderizar();
}
 
/* ---------- Formulário ---------- */
 
function mostrarErro(nome, mensagem) {
  const campo = form.elements[nome].closest(".campo");
  campo.classList.toggle("invalido", Boolean(mensagem));
  const alvo = campo.querySelector("[data-erro]");
  if (alvo) alvo.textContent = mensagem;
}
 
function validar() {
  let valido = true;
  for (const nome in obrigatorios) {
    const campo = form.elements[nome];
    const valor = campo.value.trim();
    const emailInvalido = nome === "contato" && !campo.checkValidity();
    if (!valor || emailInvalido) {
      mostrarErro(nome, obrigatorios[nome]);
      valido = false;
    } else {
      mostrarErro(nome, "");
    }
  }
  return valido;
}
 
form.addEventListener("submit", (evento) => {
  evento.preventDefault();
  if (!validar()) return;
 
  const dados = new FormData(form);
  const vaga = {
    id: Date.now(),
    empresa: dados.get("empresa").trim(),
    cargo: dados.get("cargo").trim(),
    area: dados.get("area"),
    modalidade: dados.get("modalidade"),
    cidade: dados.get("cidade").trim(),
    bolsa: dados.get("bolsa") ? Number(dados.get("bolsa")) : 0,
    contato: dados.get("contato").trim(),
    descricao: dados.get("descricao").trim(),
  };
 
  vagas.unshift(vaga);
  salvar(vagas);
  form.reset();
  busca.value = "";
  renderizar();
  document.getElementById("vagas").scrollIntoView({ behavior: "smooth" });
});
 
form.addEventListener("input", (evento) => {
  const nome = evento.target.name;
  if (nome in obrigatorios && evento.target.value.trim()) mostrarErro(nome, "");
});
 
busca.addEventListener("input", renderizar);
 
renderizar();
 
