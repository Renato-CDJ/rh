"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  Ban,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  FileText,
  GraduationCap,
  Eye,
  LayoutDashboard,
  Menu,
  Plus,
  Search,
  Settings2,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";

type Section = "dashboard" | "entrevistas" | "operadores" | "turmas" | "buscar";
type TrainingStatus =
  | "Presente"
  | "Remarcou"
  | "Não compareceu"
  | "Faltou"
  | "Desistência"
  | "Transferido";

type Candidate = {
  name: string;
  cpf: string;
  education: string;
  date: string;
  status: "Aguardando" | "Aprovado" | "Reprovado";
  admissionDate?: string;
  role?: string;
  area?: string;
  shift?: string;
  supervisor?: string;
  coordinator?: string;
  building?: "Conselheiro" | "Goitacazes";
  costCenter?: string;
  documentationPending?: "Sim" | "Não";
  documentationDetails?: string;
  registrationComplete?: boolean;
  rejectionReason?: string;
  operatorStatus?: OperatorStatus;
  terminationDate?: string;
};

type OperatorStatus = "Ativo" | "Desligado" | "INSS" | "Afastamento" | "Desaparecido";

type ChangeRecord = {
  id: number;
  date: string;
  description: string;
};

type Trainee = {
  name: string;
  role: string;
  area: string;
  manager: string;
  day1: TrainingStatus | "Pendente";
  day2: TrainingStatus | "Pendente";
  trainingDate: string;
};

const initialCandidates: Candidate[] = [
  {
    name: "Mariana Alves",
    cpf: "***.482.***-09",
    education: "Ensino médio",
    date: "20/09/2026",
    status: "Aguardando",
  },
  {
    name: "Rafael Santos",
    cpf: "***.127.***-44",
    education: "Superior completo",
    date: "20/09/2026",
    status: "Aprovado",
    shift: "Manhã",
  },
  {
    name: "Camila Ribeiro",
    cpf: "***.309.***-71",
    education: "Ensino médio",
    date: "19/09/2026",
    status: "Aprovado",
    shift: "Tarde",
  },
  {
    name: "Lucas Ferreira",
    cpf: "***.765.***-18",
    education: "Superior cursando",
    date: "19/09/2026",
    status: "Reprovado",
  },
];

const initialTrainees: Trainee[] = [
  {
    name: "Rafael Santos",
    role: "Operador",
    area: "Carteira Claro",
    manager: "Fernanda Costa",
    day1: "Presente",
    day2: "Pendente",
    trainingDate: "2026-09-22",
  },
  {
    name: "Camila Ribeiro",
    role: "Negociador",
    area: "Carteira Vivo",
    manager: "João Pedro",
    day1: "Presente",
    day2: "Pendente",
    trainingDate: "2026-09-22",
  },
  {
    name: "André Martins",
    role: "Operador",
    area: "Carteira Claro",
    manager: "Fernanda Costa",
    day1: "Remarcou",
    day2: "Pendente",
    trainingDate: "2026-09-24",
  },
  {
    name: "Beatriz Lima",
    role: "Operador",
    area: "Carteira Oi",
    manager: "Marcos Vinícius",
    day1: "Presente",
    day2: "Pendente",
    trainingDate: "2026-09-24",
  },
];

const navItems: { id: Section; label: string; icon: typeof LayoutDashboard }[] =
  [
    { id: "dashboard", label: "Visão geral", icon: LayoutDashboard },
    { id: "entrevistas", label: "Entrevistas", icon: ClipboardCheck },
    { id: "turmas", label: "Turmas previstas", icon: GraduationCap },
    { id: "operadores", label: "Turmas finalizadas", icon: CalendarDays },
    { id: "buscar", label: "Buscar operador", icon: Search },
  ];

const statusStyles: Record<string, string> = {
  Aguardando: "bg-amber-50 text-amber-700 ring-amber-200",
  Aprovado: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Reprovado: "bg-rose-50 text-rose-700 ring-rose-200",
  Presente: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Pendente: "bg-slate-100 text-slate-500 ring-slate-200",
  Remarcou: "bg-sky-50 text-sky-700 ring-sky-200",
  "Não compareceu": "bg-rose-50 text-rose-700 ring-rose-200",
  Faltou: "bg-orange-50 text-orange-700 ring-orange-200",
  Desistência: "bg-violet-50 text-violet-700 ring-violet-200",
  Transferido: "bg-indigo-50 text-indigo-700 ring-indigo-200",
};

function StatusBadge({ children }: { children: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[children] ?? statusStyles.Pendente}`}
    >
      {children}
    </span>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
}: {
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="space-y-1.5">
      <span className="text-xs font-semibold text-slate-600">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
      />
    </label>
  );
}

export default function Page() {
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showInterview, setShowInterview] = useState(false);
  const [candidateForRegistration, setCandidateForRegistration] =
    useState<Candidate | null>(null);
  const [candidateForRejection, setCandidateForRejection] =
    useState<Candidate | null>(null);
  const [candidateForViewing, setCandidateForViewing] =
    useState<Candidate | null>(null);
  const [candidates, setCandidates] = useState(initialCandidates);
  const [trainees, setTrainees] = useState(initialTrainees);
  const [query, setQuery] = useState("");
  const [classStatuses, setClassStatuses] = useState<TrainingStatus[]>([
    "Presente",
    "Remarcou",
    "Não compareceu",
    "Faltou",
    "Desistência",
    "Transferido",
  ]);
  const [showClassSettings, setShowClassSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [changeHistory, setChangeHistory] = useState<Record<string, ChangeRecord[]>>({});

  const filteredCandidates = useMemo(
    () =>
      candidates.filter((candidate) =>
        candidate.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [candidates, query],
  );

  const approveCandidate = (name: string) => {
    const candidate = candidates.find((item) => item.name === name);
    if (!candidate) return;

    setCandidates((items) =>
      items.map((item) =>
        item.name === name
          ? { ...item, status: "Aprovado", rejectionReason: undefined }
          : item,
      ),
    );

    setTrainees((items) =>
      items.some((item) => item.name === name)
        ? items
        : [
            ...items,
            {
              name: candidate.name,
              role: candidate.role || "A definir",
              area: candidate.area || "A definir",
              manager: candidate.supervisor || "A definir",
              day1: "Pendente",
              day2: "Pendente",
              trainingDate: candidate.admissionDate || "2026-09-24",
            },
          ],
    );
  };
  const rejectCandidate = (name: string, rejectionReason?: string) => {
    setCandidates((items) =>
      items.map((item) =>
        item.name === name
          ? {
              ...item,
              status: "Reprovado",
              rejectionReason: rejectionReason?.trim() || undefined,
            }
          : item,
      ),
    );
    setCandidateForRejection(null);
  };
  const resolveDocumentation = (name: string) => {
    setCandidates((items) =>
      items.map((item) =>
        item.name === name
          ? {
              ...item,
              documentationPending: "Não",
              documentationDetails: undefined,
            }
          : item,
      ),
    );
    setCandidateForViewing((item) =>
      item?.name === name
        ? { ...item, documentationPending: "Não", documentationDetails: undefined }
        : item,
    );
  };

  const updateRegistrationData = (
    name: string,
    data: Partial<Pick<Candidate, "admissionDate" | "role" | "area" | "shift" | "supervisor" | "coordinator" | "building" | "costCenter" | "documentationPending" | "documentationDetails">>,
  ) => {
    setCandidates((items) => items.map((item) => item.name === name ? { ...item, ...data } : item));
    setCandidateForViewing((item) => item?.name === name ? { ...item, ...data } : item);
    setChangeHistory((items) => ({
      ...items,
      [name]: [{ id: Date.now(), date: new Date().toLocaleString("pt-BR"), description: "Dados de Prosseguir cadastro atualizados" }, ...(items[name] ?? [])],
    }));
  };

  const completeRegistration = (
    data: Omit<Candidate, "name" | "cpf" | "education" | "date" | "status">,
    name: string,
  ) => {
    setCandidates((items) =>
      items.map((item) =>
        item.name === name
          ? { ...item, ...data, registrationComplete: true }
          : item,
      ),
    );
    setCandidateForRegistration(null);
    setActiveSection("operadores");
  };
  const updateStatus = (
    name: string,
    day: "day1" | "day2",
    value: TrainingStatus,
  ) =>
    setTrainees((items) =>
      items.map((item) =>
        item.name === name ? { ...item, [day]: value } : item,
      ),
    );
  const updateOperatorStatus = (name: string, status: OperatorStatus, terminationDate?: string) => {
    setCandidates((items) => items.map((item) => item.name === name ? { ...item, operatorStatus: status, terminationDate: status === "Desligado" ? terminationDate : undefined } : item));
    setCandidateForViewing((item) => item?.name === name ? { ...item, operatorStatus: status, terminationDate: status === "Desligado" ? terminationDate : undefined } : item);
    setChangeHistory((items) => ({
      ...items,
      [name]: [{ id: Date.now(), date: new Date().toLocaleString("pt-BR"), description: `Status alterado para ${status}${status === "Desligado" && terminationDate ? ` em ${terminationDate}` : ""}` }, ...(items[name] ?? [])],
    }));
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-900">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col bg-[#102a43] text-white transition-transform lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-[82px] items-center gap-3 border-b border-white/10 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400 text-[#102a43]">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[15px] font-bold tracking-tight">
              Integração Inicial
            </p>
            <p className="text-[11px] text-cyan-200/75">Gestão de entradas</p>
          </div>
          <button
            aria-label="Fechar menu"
            className="ml-auto lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-7">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setActiveSection(id);
                setMobileOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition ${activeSection === id ? "bg-cyan-400 text-[#102a43] shadow-lg shadow-cyan-950/20" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
            >
              <Icon className="h-[18px] w-[18px]" />
              {label}
            </button>
          ))}
        </nav>
        <div className="mx-4 mb-5 rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="mb-3 flex items-center gap-2 text-cyan-200">
            <Bell className="h-4 w-4" />
            <span className="text-xs font-semibold">Atenção</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-300">
            A turma <strong className="text-white">Previstos 22/09</strong> está
            pronta para o controle de presença.
          </p>
          <button
            onClick={() => setActiveSection("turmas")}
            className="mt-3 text-xs font-bold text-cyan-300 hover:text-cyan-100"
          >
            Abrir turma <ArrowUpRight className="ml-1 inline h-3 w-3" />
          </button>
        </div>
        <div className="flex items-center gap-3 border-t border-white/10 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f3c969] text-sm font-bold text-[#102a43]">
            AS
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold">Ana Souza</p>
            <p className="truncate text-[11px] text-slate-400">
              RH · Administradora
            </p>
          </div>
          <Settings2 className="ml-auto h-4 w-4 text-slate-400" />
        </div>
      </aside>
      {mobileOpen && (
        <button
          aria-label="Fechar navegação"
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <main className="lg:ml-[248px]">
        <header className="flex h-[82px] items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs font-medium text-slate-400">
                Segunda-feira, 21 de setembro de 2026
              </p>
              <h1 className="mt-0.5 text-xl font-bold tracking-tight text-[#102a43]">
                {activeSection === "dashboard"
                  ? "Olá, Ana. Bom dia!"
                  : navItems.find((item) => item.id === activeSection)?.label}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                aria-label="Notificações"
                onClick={() => setShowNotifications((value) => !value)}
                className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-cyan-500" />
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-12 z-20 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-[#102a43]">Notificações</p>
                    <button type="button" onClick={() => setShowNotifications(false)} aria-label="Fechar notificações" className="rounded-md p-1 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
                  </div>
                  <p className="mt-3 rounded-lg bg-cyan-50 p-3 text-xs leading-relaxed text-cyan-800">A turma Prevista 22/09 está pronta para o controle de presença.</p>
                  <button type="button" onClick={() => { setActiveSection("turmas"); setShowNotifications(false); }} className="mt-3 text-xs font-bold text-cyan-700 hover:text-cyan-900">Abrir turmas previstas</button>
                </div>
              )}
            </div>
            <div className="hidden h-8 w-px bg-slate-200 sm:block" />
            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f3c969] text-xs font-bold text-[#102a43]">
                AS
              </div>
              <span className="text-sm font-semibold text-slate-700">
                Ana Souza
              </span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-[1440px] p-5 sm:p-8">
          {activeSection === "dashboard" && (
            <Dashboard
              onNavigate={setActiveSection}
              setShowInterview={setShowInterview}
              candidates={candidates}
              trainees={trainees}
            />
          )}
          {activeSection === "entrevistas" && (
            <Interviews
              candidates={filteredCandidates}
              query={query}
              setQuery={setQuery}
              setShowInterview={setShowInterview}
              approveCandidate={approveCandidate}
              onReject={setCandidateForRejection}
              onView={setCandidateForViewing}
              onRegister={setCandidateForRegistration}
            />
          )}
          {activeSection === "operadores" && <Operators trainees={trainees} candidates={candidates} onView={setCandidateForViewing} onUpdateStatus={updateOperatorStatus} />}
          {activeSection === "buscar" && <OperatorSearch candidates={candidates} history={changeHistory} onUpdateStatus={updateOperatorStatus} onUpdateRegistration={updateRegistrationData} onView={setCandidateForViewing} />}
          {activeSection === "turmas" && (
            <Classes
              trainees={trainees}
              candidates={candidates}
              updateStatus={updateStatus}
              statuses={classStatuses}
              onOpenSettings={() => setShowClassSettings(true)}
              onViewCandidate={setCandidateForViewing}
            />
          )}
        </div>
      </main>
      {showInterview && (
        <InterviewModal
          onClose={() => setShowInterview(false)}
          onSave={() => {
            const nameInput = document.querySelector<HTMLInputElement>(
              'input[placeholder="Digite o nome"]',
            );
            const name = nameInput?.value.trim();
            if (!name) return;
            setCandidates((items) => [
              {
                name,
                cpf: "Não informado",
                education: "Não informado",
                date: new Date().toLocaleDateString("pt-BR"),
                status: "Aguardando",
              },
              ...items,
            ]);
            setShowInterview(false);
            setActiveSection("entrevistas");
          }}
        />
      )}
      {candidateForRegistration && (
        <RegistrationModal
          candidate={candidateForRegistration}
          onClose={() => setCandidateForRegistration(null)}
          onSave={(data) =>
            completeRegistration(data, candidateForRegistration.name)
          }
        />
      )}
      {candidateForRejection && (
        <RejectionModal
          candidate={candidateForRejection}
          onClose={() => setCandidateForRejection(null)}
          onSave={(reason) =>
            rejectCandidate(candidateForRejection.name, reason)
          }
        />
      )}
      {candidateForViewing && (
          <ViewCandidateModal
            candidate={candidateForViewing}
            onClose={() => setCandidateForViewing(null)}
            onResolveDocumentation={() => resolveDocumentation(candidateForViewing.name)}
            onUpdateOperatorStatus={updateOperatorStatus}
          />
      )}
      {showClassSettings && (
        <ClassSettingsModal
          statuses={classStatuses}
          onClose={() => setShowClassSettings(false)}
          onSave={(statuses) => {
            setClassStatuses(statuses);
            setShowClassSettings(false);
          }}
        />
      )}
    </div>
  );
}

function Dashboard({
  onNavigate,
  setShowInterview,
  candidates,
  trainees,
}: {
  onNavigate: (section: Section) => void;
  setShowInterview: (value: boolean) => void;
  candidates: Candidate[];
  trainees: Trainee[];
}) {
  const [selectedDate, setSelectedDate] = useState("2026-09-22");
  const selectedTrainees = trainees.filter((trainee) => trainee.trainingDate === selectedDate);
  const presentDay1 = selectedTrainees.filter((trainee) => trainee.day1 === "Presente").length;
  const presentDay2 = selectedTrainees.filter((trainee) => trainee.day2 === "Presente").length;
  const shifts = selectedTrainees.reduce<Record<string, number>>((summary, trainee) => {
    const shift = candidates.find((candidate) => candidate.name === trainee.name)?.shift ?? "Não informado";
    summary[shift] = (summary[shift] ?? 0) + 1;
    return summary;
  }, {});
  const shiftEntries = Object.entries(shifts);
  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-slate-500">
            Acompanhe as etapas de integração em um só lugar.
          </p>
          <h2 className="mt-1 text-2xl font-bold text-[#102a43]">
            Visão geral
          </h2>
        </div>
        <button
          onClick={() => setShowInterview(true)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#102a43] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1c4465]"
        >
          <Plus className="h-4 w-4" />
          Nova entrevista
        </button>
      </div>
      <section className="flex flex-col gap-4 rounded-2xl border border-cyan-100 bg-gradient-to-r from-cyan-50 to-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-wide text-cyan-700">Insights da integração</p><h3 className="mt-1 text-lg font-bold text-[#102a43]">Acompanhe a turma por data</h3><p className="mt-1 text-sm text-slate-500">Selecione uma data para atualizar os indicadores abaixo.</p></div>
        <label className="flex items-center gap-3 text-sm font-semibold text-slate-600"><CalendarDays className="h-5 w-5 text-cyan-600" /><span className="sr-only">Filtrar insights por data</span><input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="h-10 rounded-lg border border-cyan-200 bg-white px-3 text-sm font-semibold text-[#102a43] shadow-sm outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10" /></label>
      </section>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Entrevistas no mês",
            value: "48",
            detail: "+12% vs. mês anterior",
            icon: ClipboardCheck,
            tone: "cyan",
          },
          {
            label: "Aguardando análise",
            value: candidates
              .filter((item) => item.status === "Aguardando")
              .length.toString()
              .padStart(2, "0"),
            detail: "Requer atenção",
            icon: Clock3,
            tone: "amber",
          },
          {
            label: "Operadores aprovados",
            value: "36",
            detail: "+8 nesta semana",
            icon: Users,
            tone: "green",
          },
          {
            label: "Previstos na data",
            value: String(selectedTrainees.length).padStart(2, "0"),
            detail: `${presentDay1} presentes no 1º dia`,
            icon: GraduationCap,
            tone: "blue",
          },
          {
            label: "Presentes no 2º dia",
            value: String(presentDay2).padStart(2, "0"),
            detail: `${selectedTrainees.length} previstos`,
            icon: Check,
            tone: "green",
          },
        ].map(({ label, value, detail, icon: Icon, tone }) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${tone === "amber" ? "bg-amber-50 text-amber-600" : tone === "green" ? "bg-emerald-50 text-emerald-600" : tone === "blue" ? "bg-blue-50 text-blue-600" : "bg-cyan-50 text-cyan-600"}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-300" />
            </div>
            <p className="mt-5 text-sm text-slate-500">{label}</p>
            <div className="mt-1 flex items-end gap-2">
              <p className="text-2xl font-bold text-[#102a43]">{value}</p>
              <span className="mb-1 text-[11px] font-semibold text-emerald-600">
                {detail}
              </span>
            </div>
          </div>
        ))}
      </div>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between"><div><h3 className="font-bold text-[#102a43]">Quantidade por turno</h3><p className="mt-1 text-xs text-slate-500">Distribuição dos operadores previstos para {new Date(`${selectedDate}T12:00:00`).toLocaleDateString("pt-BR")}</p></div><Clock3 className="h-5 w-5 text-cyan-600" /></div>
        {shiftEntries.length ? <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{shiftEntries.map(([shift, count]) => <div key={shift} className="rounded-xl border border-slate-100 bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">{shift}</p><p className="mt-1 text-2xl font-bold text-[#102a43]">{count}</p><div className="mt-3 h-2 rounded-full bg-slate-200"><div className="h-2 rounded-full bg-cyan-500" style={{ width: `${Math.max(16, (count / Math.max(selectedTrainees.length, 1)) * 100)}%` }} /></div></div>)}</div> : <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Nenhuma turma prevista para esta data.</p>}
      </section>
      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div>
              <h3 className="font-bold text-[#102a43]">Próximas turmas</h3>
              <p className="mt-1 text-xs text-slate-500">
                Acompanhe o calendário de treinamentos
              </p>
            </div>
            <button
              onClick={() => onNavigate("turmas")}
              className="text-xs font-bold text-cyan-600 hover:text-cyan-700"
            >
              Ver todas
            </button>
          </div>
          <div className="space-y-1 p-3">
            <ClassRow
              day="22"
              month="SET"
              title="Previstos 22/09/2026"
              subtitle="Treinamento · 04 pessoas"
              status="Hoje"
              onClick={() => onNavigate("turmas")}
            />
            <ClassRow
              day="24"
              month="SET"
              title="Previstos 24/09/2026"
              subtitle="Treinamento · 08 pessoas"
              status="Programada"
              onClick={() => onNavigate("turmas")}
            />
            <ClassRow
              day="29"
              month="SET"
              title="Previstos 29/09/2026"
              subtitle="Treinamento · 06 pessoas"
              status="Programada"
              onClick={() => onNavigate("turmas")}
            />
          </div>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h3 className="font-bold text-[#102a43]">Fluxo de integração</h3>
            <p className="mt-1 text-xs text-slate-500">
              Status geral das entradas
            </p>
          </div>
          <div className="space-y-5 p-5">
            {[
              {
                label: "Entrevistas realizadas",
                value: 48,
                color: "bg-cyan-500",
                width: "100%",
              },
              {
                label: "Aprovados para operação",
                value: 36,
                color: "bg-emerald-500",
                width: "75%",
              },
              {
                label: "Em treinamento",
                value: 12,
                color: "bg-amber-400",
                width: "42%",
              },
              {
                label: "Integração concluída",
                value: 8,
                color: "bg-blue-500",
                width: "22%",
              },
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex justify-between text-xs">
                  <span className="font-medium text-slate-600">
                    {item.label}
                  </span>
                  <span className="font-bold text-[#102a43]">{item.value}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className={`h-2 rounded-full ${item.color}`}
                    style={{ width: item.width }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h3 className="font-bold text-[#102a43]">Últimas entrevistas</h3>
            <p className="mt-1 text-xs text-slate-500">
              Cadastros mais recentes do RH
            </p>
          </div>
          <button
            onClick={() => onNavigate("entrevistas")}
            className="text-xs font-bold text-cyan-600"
          >
            Ver entrevistas
          </button>
        </div>
        <CandidateTable
          candidates={candidates.slice(0, 3)}
          compact
          onView={() => {}}
        />
      </section>
    </div>
  );
}

function ClassRow({
  day,
  month,
  title,
  subtitle,
  status,
  onClick,
}: {
  day: string;
  month: string;
  title: string;
  subtitle: string;
  status: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-lg p-3 text-left transition hover:bg-slate-50"
    >
      <div className="flex h-11 w-11 flex-col items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
        <span className="text-sm font-bold leading-none">{day}</span>
        <span className="mt-0.5 text-[9px] font-bold">{month}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-700">{title}</p>
        <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
      </div>
      <StatusBadge>{status}</StatusBadge>
      <ArrowUpRight className="h-4 w-4 text-slate-300" />
    </button>
  );
}

function Interviews({
  candidates,
  query,
  setQuery,
  setShowInterview,
  approveCandidate,
  onReject,
  onView,
  onRegister,
}: {
  candidates: Candidate[];
  query: string;
  setQuery: (value: string) => void;
  setShowInterview: (value: boolean) => void;
  approveCandidate: (name: string) => void;
  onReject: (candidate: Candidate) => void;
  onView: (candidate: Candidate) => void;
  onRegister: (candidate: Candidate) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-slate-500">
            Cadastre e acompanhe os candidatos em processo seletivo.
          </p>
          <h2 className="mt-1 text-2xl font-bold text-[#102a43]">
            Processo de entrevista
          </h2>
        </div>
        <button
          onClick={() => setShowInterview(true)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#102a43] px-4 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" />
          Nova entrevista
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <MiniStat label="Total de fichas" value="48" icon={FileText} />
        <MiniStat label="Aguardando análise" value="12" icon={Clock3} />
        <MiniStat label="Aprovados" value="36" icon={Check} />
      </div>
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-bold text-[#102a43]">Fichas de candidatos</h3>
            <p className="mt-1 text-xs text-slate-500">
              A aprovação libera o cadastro operacional.
            </p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar candidato"
                className="h-9 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-xs outline-none focus:border-cyan-500 sm:w-52"
              />
            </div>
            <button className="rounded-lg border border-slate-200 p-2 text-slate-500">
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
        <CandidateTable
          candidates={candidates}
          approveCandidate={approveCandidate}
          onReject={onReject}
          onView={onView}
          onRegister={onRegister}
        />
      </section>
    </div>
  );
}

function CandidateTable({
  candidates,
  compact = false,
  approveCandidate,
  onReject,
  onView,
  onRegister,
}: {
  candidates: Candidate[];
  compact?: boolean;
  approveCandidate?: (name: string) => void;
  onReject?: (candidate: Candidate) => void;
  onView?: (candidate: Candidate) => void;
  onRegister?: (candidate: Candidate) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-left">
        <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-400">
          <tr>
            <th className="px-5 py-3">Candidato</th>
            <th className="px-5 py-3">CPF</th>
            <th className="px-5 py-3">Escolaridade</th>
            <th className="px-5 py-3">Data</th>
            <th className="px-5 py-3">Status</th>
            {!compact && <th className="px-5 py-3">Ação</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {candidates.map((candidate) => (
            <tr key={candidate.name} className="text-sm">
              <td className="px-5 py-4 font-semibold text-slate-700">
                <button
                  type="button"
                  onClick={() => onView?.(candidate)}
                  className="inline-flex items-center gap-2 text-left transition-colors hover:text-cyan-700 hover:underline focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                  aria-label={`Visualizar ficha de ${candidate.name}`}
                >
                  {candidate.name}
                  {candidate.documentationPending === "Sim" && (
                    <span
                      title="Pendência de Documentação"
                      aria-label={`Pendência de Documentaç��������o${candidate.documentationDetails ? `: ${candidate.documentationDetails}` : ""}`}
                      className="inline-flex rounded-full bg-amber-50 p-1 text-amber-600 ring-1 ring-inset ring-amber-200"
                    >
                      <AlertCircle className="h-3.5 w-3.5" />
                    </span>
                  )}
                </button>
              </td>
              <td className="px-5 py-4 text-slate-500">{candidate.cpf}</td>
              <td className="px-5 py-4 text-slate-500">
                {candidate.education}
              </td>
              <td className="px-5 py-4 text-slate-500">{candidate.date}</td>
              <td className="px-5 py-4">
                <StatusBadge>{candidate.status}</StatusBadge>
              </td>
              {!compact && (
                <td className="px-5 py-4">
                  {candidate.status === "Aguardando" ? (
                    <div className="flex items-center gap-3">
  <button
  onClick={() => approveCandidate?.(candidate.name)}
  className="inline-flex items-center rounded-full bg-cyan-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-cyan-700"
  >
  Aprovar ficha
  </button>
  <button
  onClick={() => onReject?.(candidate)}
  className="inline-flex items-center rounded-full bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-rose-700"
  >
  Reprovar
  </button>
                    </div>
                  ) : candidate.status === "Aprovado" &&
                    !candidate.registrationComplete ? (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onRegister?.(candidate)}
                        className="rounded-md bg-cyan-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-cyan-700"
                      >
                        Prosseguir cadastro
                      </button>
                      <button
                        onClick={() => onView?.(candidate)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Visualizar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onView?.(candidate)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Visualizar
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MiniStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof FileText;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-0.5 text-xl font-bold text-[#102a43]">{value}</p>
      </div>
    </div>
  );
}

function Operators({
  trainees,
  candidates,
  onView,
}: {
  trainees: Trainee[];
  candidates: Candidate[];
  onView: (candidate: Candidate) => void;
  onUpdateStatus: (name: string, status: OperatorStatus, date?: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("2026-09-22");
  const [operatorFilter, setOperatorFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const dateTrainees = trainees.filter((trainee) => trainee.trainingDate === selectedDate);
  const filtered = dateTrainees.filter((trainee) =>
    trainee.name.toLowerCase().includes(search.toLowerCase()) &&
    (!operatorFilter || trainee.name === operatorFilter) &&
    (!areaFilter || trainee.area === areaFilter) &&
    (!roleFilter || trainee.role === roleFilter),
  );
  const operatorOptions = [...new Set(dateTrainees.map((trainee) => trainee.name))];
  const areaOptions = [...new Set(dateTrainees.map((trainee) => trainee.area))];
  const roleOptions = [...new Set(dateTrainees.map((trainee) => trainee.role))];
  const markedDates = [...new Set(trainees.map((trainee) => trainee.trainingDate))];
  const calendarDays = Array.from({ length: 30 }, (_, index) => index + 1);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">Consulte as turmas concluídas por data e visualize todos os participantes.</p>
        <h2 className="mt-1 text-2xl font-bold text-[#102a43]">Turmas finalizadas</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <MiniStat label="Turmas no período" value={String(markedDates.length)} icon={CalendarDays} />
        <MiniStat label="Operadores listados" value={String(trainees.length)} icon={Users} />
        <MiniStat label="Com pendência" value={String(trainees.filter((item) => candidates.find((candidate) => candidate.name === item.name)?.documentationPending === "Sim").length)} icon={AlertCircle} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wide text-cyan-600">Calendário</p><h3 className="mt-1 text-lg font-bold text-[#102a43]">Setembro 2026</h3></div><CalendarDays className="h-5 w-5 text-cyan-600" /></div>
          <div className="mt-5 grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase text-slate-400">{["D","S","T","Q","Q","S","S"].map((day, index) => <span key={`${day}-${index}`} className="py-1">{day}</span>)}
            {calendarDays.map((day) => { const date = `2026-09-${String(day).padStart(2, "0")}`; const isMarked = markedDates.includes(date); const isSelected = date === selectedDate; return <button key={date} type="button" onClick={() => isMarked && setSelectedDate(date)} disabled={!isMarked} className={`relative flex h-9 items-center justify-center rounded-lg text-sm transition ${isSelected ? "bg-cyan-600 font-bold text-white" : isMarked ? "bg-cyan-50 font-semibold text-cyan-700 hover:bg-cyan-100" : "text-slate-300"}`}>{day}{isMarked && !isSelected && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-cyan-500" />}</button>; })}
          </div>
          <div className="mt-5 flex items-center gap-2 text-xs text-slate-500"><span className="h-2 w-2 rounded-full bg-cyan-500" /> Dias com turma finalizada</div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-bold uppercase tracking-wide text-cyan-600">Turma finalizada</p><h3 className="mt-1 text-lg font-bold text-[#102a43]">{new Date(`${selectedDate}T12:00:00`).toLocaleDateString("pt-BR")}</h3><p className="mt-1 text-xs text-slate-500">{filtered.length} operadores nesta turma · clique em um nome para abrir a ficha completa.</p></div><label className="relative block w-full md:w-64"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Pesquisar operador" className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10" /></label></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left"><thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-400"><tr><th className="px-5 py-3"><div className="space-y-2"><span>Operador</span><select aria-label="Filtrar por operador" value={operatorFilter} onChange={(event) => setOperatorFilter(event.target.value)} className="h-8 w-full min-w-36 rounded-md border border-slate-200 bg-white px-2 text-xs font-medium normal-case tracking-normal text-slate-600"><option value="">Todos</option>{operatorOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></div></th><th className="px-5 py-3"><div className="space-y-2"><span>Carteira</span><select aria-label="Filtrar por carteira" value={areaFilter} onChange={(event) => setAreaFilter(event.target.value)} className="h-8 w-full min-w-32 rounded-md border border-slate-200 bg-white px-2 text-xs font-medium normal-case tracking-normal text-slate-600"><option value="">Todas</option>{areaOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></div></th><th className="px-5 py-3"><div className="space-y-2"><span>Cargo</span><select aria-label="Filtrar por cargo" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="h-8 w-full min-w-28 rounded-md border border-slate-200 bg-white px-2 text-xs font-medium normal-case tracking-normal text-slate-600"><option value="">Todos</option>{roleOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></div></th><th className="px-5 py-3">Presença</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((trainee) => { const candidate = candidates.find((item) => item.name === trainee.name); return <tr key={trainee.name} className="text-sm"><td className="px-5 py-4"><button type="button" onClick={() => candidate && onView(candidate)} className="inline-flex items-center gap-2 font-semibold text-slate-700 hover:text-cyan-700 hover:underline">{trainee.name}{candidate?.documentationPending === "Sim" && <span title="Pendência de Documentação" className="rounded-full bg-amber-50 p-1 text-amber-600"><AlertCircle className="h-3.5 w-3.5" /></span>}</button></td><td className="px-5 py-4 text-slate-500">{trainee.area}</td><td className="px-5 py-4 text-slate-500">{trainee.role}</td><td className="px-5 py-4"><StatusBadge>{trainee.day2 === "Pendente" ? trainee.day1 : trainee.day2}</StatusBadge></td></tr>; })}</tbody></table></div>
          {!filtered.length && <div className="p-10 text-center text-sm text-slate-500">Nenhum operador encontrado para esta data.</div>}
        </section>
      </div>
    </div>
  );
}

function OperatorSearch({
  candidates,
  history,
  onUpdateStatus,
  onUpdateRegistration,
  onView,
}: {
  candidates: Candidate[];
  history: Record<string, ChangeRecord[]>;
  onUpdateStatus: (name: string, status: OperatorStatus, date?: string) => void;
  onUpdateRegistration: (name: string, data: Partial<Pick<Candidate, "admissionDate" | "role" | "area" | "shift" | "supervisor" | "coordinator" | "building" | "costCenter" | "documentationPending" | "documentationDetails">>) => void;
  onView: (candidate: Candidate) => void;
}) {
  const [query, setQuery] = useState("");
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [status, setStatus] = useState<OperatorStatus>("Ativo");
  const [terminationDate, setTerminationDate] = useState("");
  const [editingRegistration, setEditingRegistration] = useState(false);
  const [registrationDraft, setRegistrationDraft] = useState<Partial<Candidate>>({});
  const matches = candidates.filter((candidate) => candidate.status === "Aprovado" && `${candidate.name} ${candidate.cpf}`.toLowerCase().includes(query.toLowerCase()));
  const selected = candidates.find((candidate) => candidate.name === selectedName) ?? null;

  const selectOperator = (candidate: Candidate) => {
    setSelectedName(candidate.name);
    setStatus(candidate.operatorStatus ?? "Ativo");
    setTerminationDate(candidate.terminationDate ?? "");
    setRegistrationDraft({ admissionDate: candidate.admissionDate, role: candidate.role, area: candidate.area, shift: candidate.shift, supervisor: candidate.supervisor, coordinator: candidate.coordinator, building: candidate.building, costCenter: candidate.costCenter, documentationPending: candidate.documentationPending, documentationDetails: candidate.documentationDetails });
    setEditingRegistration(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">Consulte, atualize e acompanhe todas as alterações feitas nas fichas.</p>
        <h2 className="mt-1 text-2xl font-bold text-[#102a43]">Buscar operador</h2>
      </div>
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="relative block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nome ou CPF do operador" className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10" />
          </label>
          <div className="mt-4 flex flex-col gap-2">
            {matches.map((candidate) => (
              <button key={candidate.name} type="button" onClick={() => selectOperator(candidate)} className={`flex items-center justify-between rounded-xl border p-3 text-left transition ${selectedName === candidate.name ? "border-cyan-400 bg-cyan-50" : "border-slate-100 hover:border-cyan-200 hover:bg-slate-50"}`}>
                <span><span className="block text-sm font-bold text-[#102a43]">{candidate.name}</span><span className="mt-0.5 block text-xs text-slate-500">{candidate.cpf}</span></span>
                <StatusBadge>{candidate.operatorStatus ?? "Ativo"}</StatusBadge>
              </button>
            ))}
            {!matches.length && <p className="px-2 py-8 text-center text-sm text-slate-500">Nenhum operador encontrado.</p>}
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {!selected ? <div className="flex min-h-[360px] flex-col items-center justify-center text-center"><div className="flex size-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600"><FileText className="h-6 w-6" /></div><h3 className="mt-4 text-lg font-bold text-[#102a43]">Selecione um operador</h3><p className="mt-1 max-w-sm text-sm text-slate-500">Pesquise pelo nome ou CPF para visualizar a ficha completa e editar os dados.</p></div> : (
            <div>
              <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-start"><div><p className="text-xs font-bold uppercase tracking-wide text-cyan-600">Ficha completa</p><h3 className="mt-1 text-2xl font-bold text-[#102a43]">{selected.name}</h3><p className="mt-1 text-sm text-slate-500">{selected.cpf} · {selected.education}</p></div><button type="button" onClick={() => onView(selected)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Eye className="h-4 w-4" /> Abrir ficha detalhada</button></div>
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Prosseguir cadastro</p><p className="mt-1 text-xs text-slate-500">Dados de admissão e alocação do operador</p></div><button type="button" onClick={() => setEditingRegistration((value) => !value)} className="rounded-lg border border-emerald-300 bg-white px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50">{editingRegistration ? "Cancelar" : "Editar dados"}</button></div>{editingRegistration ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{([["admissionDate", "Data de admissão", "date"], ["role", "Cargo", "text"], ["area", "Carteira", "text"], ["shift", "Turno", "text"], ["supervisor", "Supervisor", "text"], ["coordinator", "Coordenador", "text"], ["costCenter", "Centro de custo", "text"]] as const).map(([key, label, type]) => <label key={key} className="text-xs font-semibold text-slate-600">{label}<input type={type} value={String(registrationDraft[key] ?? "")} onChange={(event) => setRegistrationDraft((draft) => ({ ...draft, [key]: event.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal" /></label>)}<label className="text-xs font-semibold text-slate-600">Prédio<select value={String(registrationDraft.building ?? "")} onChange={(event) => setRegistrationDraft((draft) => ({ ...draft, building: event.target.value as Candidate["building"] }))} className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal"><option value="">Não informado</option><option>Conselheiro</option><option>Goitacazes</option></select></label><button type="button" onClick={() => { onUpdateRegistration(selected.name, registrationDraft); setEditingRegistration(false); }} className="sm:col-span-2 h-10 rounded-lg bg-emerald-700 px-4 text-sm font-bold text-white hover:bg-emerald-800">Salvar dados do cadastro</button></div> : <div className="mt-4 grid gap-3 sm:grid-cols-2"><InfoCard label="Cargo" value={selected.role ?? "Não informado"} /><InfoCard label="Carteira" value={selected.area ?? "Não informado"} /><InfoCard label="Centro de custo" value={selected.costCenter ?? "Não informado"} /><InfoCard label="Admissão" value={selected.admissionDate ?? "Não informado"} /><InfoCard label="Turno" value={selected.shift ?? "Não informado"} /><InfoCard label="Prédio" value={selected.building ?? "Não informado"} /></div>}</div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2"><InfoCard label="Entrevista" value={selected.date} /><InfoCard label="Documentação" value={selected.documentationPending === "Sim" ? `Pendente${selected.documentationDetails ? ` · ${selected.documentationDetails}` : ""}` : "Regularizada"} /></div>
              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Atualizar situação</p><div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"><select value={status} onChange={(event) => setStatus(event.target.value as OperatorStatus)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"><option>Ativo</option><option>Desligado</option><option>INSS</option><option>Afastamento</option><option>Desaparecido</option></select><input type="date" value={terminationDate} onChange={(event) => setTerminationDate(event.target.value)} disabled={status !== "Desligado"} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm disabled:bg-slate-100" /><button type="button" onClick={() => { onUpdateStatus(selected.name, status, terminationDate || undefined); }} className="h-10 rounded-lg bg-[#102a43] px-4 text-sm font-semibold text-white hover:bg-[#1c4465]">Salvar alteração</button></div><p className="mt-2 text-xs text-slate-500">A data de desligamento é usada somente quando o status for Desligado.</p></div>
              <div className="mt-6"><div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Histórico de alterações</p><span className="text-xs text-slate-400">{(history[selected.name] ?? []).length} registro(s)</span></div><div className="mt-3 flex flex-col gap-2">{(history[selected.name] ?? []).map((entry) => <div key={entry.id} className="rounded-lg border border-slate-100 bg-white p-3"><p className="text-sm font-medium text-slate-700">{entry.description}</p><p className="mt-1 text-xs text-slate-400">{entry.date}</p></div>)}{!(history[selected.name] ?? []).length && <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">Nenhuma alteração registrada nesta sessão.</p>}</div></div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-slate-100 bg-slate-50 p-3"><p className="text-xs font-semibold text-slate-400">{label}</p><p className="mt-1 text-sm font-semibold text-slate-700">{value}</p></div>;
}

function Classes({
  trainees,
  candidates,
  updateStatus,
  statuses,
  onOpenSettings,
  onViewCandidate,
}: {
  trainees: Trainee[];
  candidates: Candidate[];
  updateStatus: (
    name: string,
    day: "day1" | "day2",
    value: TrainingStatus,
  ) => void;
  statuses: TrainingStatus[];
  onOpenSettings: () => void;
  onViewCandidate: (candidate: Candidate) => void;
}) {
  const [selectedDay, setSelectedDay] = useState<"day1" | "day2">("day1");
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-slate-500">
            As fichas aprovadas são organizadas automaticamente por data.
          </p>
          <h2 className="mt-1 text-2xl font-bold text-[#102a43]">
            Turmas previstas
          </h2>
        </div>
        <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700">
          <CalendarDays className="h-4 w-4 text-cyan-600" />
          Selecionar data
        </button>
        <button
          onClick={onOpenSettings}
          aria-label="Configurar opções de presença"
          title="Configurar opções de presença"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Settings2 className="h-4 w-4 text-cyan-600" />
          <span className="hidden sm:inline">Configurar opções</span>
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border-2 border-cyan-400 bg-cyan-50/50 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-cyan-700">
              Turma em andamento
            </p>
            <span className="h-2 w-2 rounded-full bg-cyan-500" />
          </div>
          <p className="mt-3 text-lg font-bold text-[#102a43]">
            Previstos 22/09/2026
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Treinamento de integração · 04 pessoas
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Próxima turma
          </p>
          <p className="mt-3 text-lg font-bold text-[#102a43]">
            Previstos 24/09/2026
          </p>
          <p className="mt-1 text-xs text-slate-500">
            08 pessoas aguardando início
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Total no mês
          </p>
          <p className="mt-3 text-lg font-bold text-[#102a43]">06 turmas</p>
          <p className="mt-1 text-xs text-slate-500">
            54 profissionais previstos
          </p>
        </div>
      </div>
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-[#102a43]">Previstos 22/09/2026</h3>
              <StatusBadge>Hoje</StatusBadge>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Registre a presença dos participantes no treinamento.
            </p>
          </div>
          <div className="flex rounded-lg bg-slate-100 p-1">
            <button
              onClick={() => setSelectedDay("day1")}
              className={`rounded-md px-3 py-2 text-xs font-bold ${selectedDay === "day1" ? "bg-white text-[#102a43] shadow-sm" : "text-slate-500"}`}
            >
              1º dia · 22/09
            </button>
            <button
              onClick={() => setSelectedDay("day2")}
              className={`rounded-md px-3 py-2 text-xs font-bold ${selectedDay === "day2" ? "bg-white text-[#102a43] shadow-sm" : "text-slate-500"}`}
            >
              2º dia · 23/09
            </button>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {trainees.map((trainee, index) => (
            <div
              key={trainee.name}
              className="flex flex-col gap-3 p-5 md:flex-row md:items-center"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                  {index + 1}
                </div>
                {(() => {
                  const candidate = candidates.find((item) => item.name === trainee.name);
                  const hasDocumentationPending = candidate?.documentationPending === "Sim";
                  return (
                    <div className="min-w-0">
                      {candidate ? (
                        <button
                          type="button"
                          onClick={() => onViewCandidate(candidate)}
                          className="group inline-flex max-w-full items-center gap-2 text-left"
                          title="Visualizar ficha completa"
                        >
                          <span className="truncate text-sm font-semibold text-slate-700 group-hover:text-cyan-700">
                            {trainee.name}
                          </span>
                          {hasDocumentationPending && (
                            <span
                              title={`Pendência de Documentação${candidate.documentationDetails ? `: ${candidate.documentationDetails}` : ""}`}
                              aria-label="Pendência de Documentação"
                              className="inline-flex shrink-0 rounded-full bg-amber-50 p-1 text-amber-600 ring-1 ring-inset ring-amber-200"
                            >
                              <AlertCircle className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </button>
                      ) : (
                        <p className="text-sm font-semibold text-slate-700">{trainee.name}</p>
                      )}
                      <p className="mt-0.5 text-xs text-slate-400">
                        {trainee.role} · {trainee.area}
                      </p>
                    </div>
                  );
                })()}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge>{trainee[selectedDay]}</StatusBadge>
                <select
                  value={
                    trainee[selectedDay] === "Pendente"
                      ? ""
                      : trainee[selectedDay]
                  }
                  onChange={(event) =>
                    event.target.value &&
                    updateStatus(
                      trainee.name,
                      selectedDay,
                      event.target.value as TrainingStatus,
                    )
                  }
                  className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-600 outline-none focus:border-cyan-500"
                >
                  <option value="">Atualizar status</option>
                  {[
                    "Presente",
                    "Remarcou",
                    "Não compareceu",
                    "Faltou",
                    "Desistência",
                    "Transferido",
                  ].map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ClassSettingsModal({
  statuses,
  onClose,
  onSave,
}: {
  statuses: string[];
  onClose: () => void;
  onSave: (statuses: TrainingStatus[]) => void;
}) {
  const [items, setItems] = useState(statuses);
  const [newItem, setNewItem] = useState("");
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const addItem = () => {
    const value = newItem.trim();
    if (!value) return;
    if (editingItem) {
      setItems((current) =>
        current.map((item) => (item === editingItem ? value : item)),
      );
      setEditingItem(null);
    } else if (!items.includes(value))
      setItems((current) => [...current, value]);
    setNewItem("");
  };
  const removeItem = (value: string) =>
    setItems((current) => current.filter((item) => item !== value));
  const editItem = (value: string) => {
    setEditingItem(value);
    setNewItem(value);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-6">
      <div className="w-full max-w-lg rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-600">
              Turmas previstas
            </p>
            <h2 className="mt-1 text-lg font-bold text-[#102a43]">
              Opções de presença
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              As opções ficam disponíveis no 1º e no 2º dia.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-6 flex gap-2">
          <input
            value={newItem}
            onChange={(event) => setNewItem(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") addItem();
            }}
            placeholder="Nova opção"
            className="h-10 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
          />
          <button
            onClick={addItem}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#102a43] px-4 text-sm font-semibold text-white hover:bg-[#1c4465]"
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </button>
        </div>
        <div className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200">
          {items.map((item) => (
            <div
              key={item}
              className="flex items-center justify-between px-4 py-3"
            >
              <span className="text-sm font-medium text-slate-700">{item}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => editItem(item)}
                  aria-label={`Editar ${item}`}
                  className="rounded-md px-2 py-1 text-xs font-semibold text-cyan-600 hover:bg-cyan-50"
                >
                  Editar
                </button>
                <button
                  onClick={() => removeItem(item)}
                  aria-label={`Excluir ${item}`}
                  className="rounded-md p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(items as TrainingStatus[])}
            className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700"
          >
            Salvar opções
          </button>
        </div>
      </div>
    </div>
  );
}

function RegistrationModal({
  candidate,
  onClose,
  onSave,
}: {
  candidate: Candidate;
  onClose: () => void;
  onSave: (
    data: Omit<Candidate, "name" | "cpf" | "education" | "date" | "status">,
  ) => void;
}) {
  const [showCostCenterManager, setShowCostCenterManager] = useState(false);
  const [costCenters, setCostCenters] = useState(["ROVERI", "CELTA"]);
  const [newCostCenter, setNewCostCenter] = useState("");
  const [editingCostCenter, setEditingCostCenter] = useState<string | null>(
    null,
  );
  const admissionDateInputRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState({
    admissionDate: "",
    role: "OPERADOR(A) COBRADOR(A)",
    area: "",
    shift: "",
    supervisor: "",
    coordinator: "",
    building: "Conselheiro" as "Conselheiro" | "Goitacazes",
    costCenter: "ROVERI",
    documentationPending: "" as "" | "Sim" | "Não",
    documentationDetails: "",
  });
  const set = (key: string, value: string) =>
    setData((item) => ({ ...item, [key]: value }));
  const saveCostCenter = () => {
    const value = newCostCenter.trim().toUpperCase();
    if (!value) return;
    setCostCenters((items) =>
      editingCostCenter
        ? items.map((item) => (item === editingCostCenter ? value : item))
        : items.includes(value)
          ? items
          : [...items, value],
    );
    setData((item) => ({
      ...item,
      costCenter:
        editingCostCenter === data.costCenter ? value : item.costCenter,
    }));
    setNewCostCenter("");
    setEditingCostCenter(null);
  };
  const removeCostCenter = (value: string) => {
    setCostCenters((items) => items.filter((item) => item !== value));
    if (data.costCenter === value)
      setData((item) => ({ ...item, costCenter: "" }));
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-6">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-auto rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#102a43]">
              Prosseguir cadastro
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Complete os dados de {candidate.name} para gerar a turma prevista.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-600">
              Data de admissão
            </span>
              <div className="relative">
                <input
                  ref={admissionDateInputRef}
                  type="date"
                  value={data.admissionDate}
                  onChange={(e) => set("admissionDate", e.target.value)}
                  aria-label="Data de admissão"
                  className="relative z-0 h-10 w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 text-sm"
                />
                <CalendarDays
                  className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
              </div>
          </label>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                Centro de custo
              </span>
              <button
                type="button"
                onClick={() => setShowCostCenterManager(true)}
                aria-label="Gerenciar centros de custo"
                title="Gerenciar centros de custo"
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-cyan-600"
              >
                <Settings2 className="h-4 w-4" />
              </button>
            </div>
            <select
              value={data.costCenter}
              onChange={(e) => set("costCenter", e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="">Selecione</option>
              {costCenters.map((center) => (
                <option key={center}>{center}</option>
              ))}
            </select>
          </div>
          <label className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-600">
              Registro
            </span>
            <select
              value={data.role}
              onChange={(e) => set("role", e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
            >
              <option>OPERADOR(A) COBRADOR(A)</option>
              <option>NEGOCIADOR</option>
              <option>ESTAGIÁRIO</option>
            </select>
          </label>
          <Field label="Carteira" placeholder="Ex.: Claro, Vivo ou Oi" />
          <label className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-600">Turno</span>
            <select
              value={data.shift}
              onChange={(e) => set("shift", e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="">Selecione</option>
              <option>Manhã</option>
              <option>Tarde</option>
              <option>Integral</option>
            </select>
          </label>
          <Field label="Supervisor" placeholder="Nome do supervisor" />
          <Field label="Coordenador" placeholder="Nome do coordenador" />
          <label className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-600">
              Documentação pendente <span className="font-normal text-slate-400">(opcional)</span>
            </span>
            <select
              value={data.documentationPending}
              onChange={(e) => set("documentationPending", e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="">Selecione</option>
              <option value="Não">Não</option>
              <option value="Sim">Sim</option>
            </select>
          </label>
          {data.documentationPending === "Sim" && (
            <label className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-600">
                Descrição da pendência <span className="font-normal text-slate-400">(opcional)</span>
              </span>
              <input
                value={data.documentationDetails}
                onChange={(e) => set("documentationDetails", e.target.value)}
                placeholder="Ex.: cópia do documento de identidade"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
              />
            </label>
          )}
          <label className="space-y-1.5 sm:col-span-2">
            <span className="text-xs font-semibold text-slate-600">Prédio</span>
            <select
              value={data.building}
              onChange={(e) =>
                set("building", e.target.value as "Conselheiro" | "Goitacazes")
              }
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
            >
              <option>Conselheiro</option>
              <option>Goitacazes</option>
            </select>
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
          >
            Cancelar
          </button>
          <button
            onClick={() =>
              onSave({
                ...data,
                documentationPending: data.documentationPending || undefined,
                documentationDetails:
                  data.documentationPending === "Sim"
                    ? data.documentationDetails.trim() || undefined
                    : undefined,
              })
            }
            className="rounded-lg bg-[#102a43] px-4 py-2 text-sm font-semibold text-white"
          >
            Salvar e gerar turma
          </button>
        </div>
      </div>
      {showCostCenterManager && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-[#102a43]/45 p-0 backdrop-blur-sm sm:items-center sm:p-6">
          <div className="w-full max-w-md rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-600">Configurações</p>
                <h3 className="mt-1 text-lg font-bold text-[#102a43]">Gerenciar centros de custo</h3>
                <p className="mt-1 text-sm text-slate-500">Adicione, edite ou remova opções do cadastro.</p>
              </div>
              <button onClick={() => setShowCostCenterManager(false)} aria-label="Fechar" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4 p-6">
              <div className="flex gap-2">
                <input value={newCostCenter} onChange={(event) => setNewCostCenter(event.target.value)} placeholder="Novo centro de custo" className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-sm uppercase outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10" />
                <button onClick={saveCostCenter} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#102a43] px-3 text-sm font-semibold text-white hover:bg-[#1c4465]"><Plus className="h-4 w-4" />{editingCostCenter ? "Salvar" : "Adicionar"}</button>
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-200">
                {costCenters.map((center) => (
                  <div key={center} className="flex items-center justify-between border-b border-slate-100 px-4 py-3 last:border-0">
                    <span className="text-sm font-semibold text-slate-700">{center}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditingCostCenter(center); setNewCostCenter(center) }} className="rounded-md px-2 py-1 text-xs font-semibold text-cyan-700 hover:bg-cyan-50">Editar</button>
                      <button onClick={() => removeCostCenter(center)} aria-label={`Excluir ${center}`} className="rounded-md p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><X className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button onClick={() => { setShowCostCenterManager(false); setNewCostCenter(''); setEditingCostCenter(null) }} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">Concluir</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RejectionModal({
  candidate,
  onClose,
  onSave,
}: {
  candidate: Candidate;
  onClose: () => void;
  onSave: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-6">
      <div className="w-full max-w-md rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#102a43]">Reprovar ficha</h2>
            <p className="mt-1 text-sm text-slate-500">
              Confirme a reprovação de {candidate.name}.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <label className="mt-6 block space-y-1.5">
          <span className="text-xs font-semibold text-slate-600">
            Motivo da reprovação{" "}
            <span className="font-normal text-slate-400">(opcional)</span>
          </span>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Descreva o motivo, se desejar"
            rows={4}
            className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
          />
        </label>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(reason)}
            className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
          >
            <Ban className="h-4 w-4" />
            Reprovar ficha
          </button>
        </div>
      </div>
    </div>
  );
}

function ViewCandidateModal({
  candidate,
  onClose,
  onResolveDocumentation,
  onUpdateOperatorStatus,
}: {
  candidate: Candidate;
  onClose: () => void;
  onResolveDocumentation: () => void;
  onUpdateOperatorStatus?: (name: string, status: OperatorStatus, terminationDate?: string) => void;
}) {
  const [operatorStatus, setOperatorStatus] = useState<OperatorStatus>(candidate.operatorStatus ?? "Ativo");
  const [terminationDate, setTerminationDate] = useState(candidate.terminationDate ?? "");
  const saveOperatorStatus = (status: OperatorStatus, date = terminationDate) => {
    setOperatorStatus(status);
    onUpdateOperatorStatus?.(candidate.name, status, date || undefined);
  };
  const interviewFields = [
    ["Nome completo", candidate.name],
    ["CPF", candidate.cpf],
    ["Escolaridade", candidate.education],
    ["Data da entrevista", candidate.date],
    ["Resultado", candidate.status],
  ];
  const registrationFields = [
    ["Data de admissão", candidate.admissionDate],
    ["Registro", candidate.role],
    ["Carteira", candidate.area],
    ["Turno", candidate.shift],
    ["Supervisor", candidate.supervisor],
    ["Coordenador", candidate.coordinator],
    ["Centro de custo", candidate.costCenter],
    ["Prédio", candidate.building],
  ];
  const FieldList = ({ fields }: { fields: string[][] }) => (
    <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
      {fields.map(([label, value]) => (
        <div key={label}>
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-1 text-sm font-medium text-slate-700">{value || "Não informado"}</p>
        </div>
      ))}
    </div>
  );
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-6">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-auto rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl sm:p-7">
        <div className="flex items-start justify-between border-b border-slate-100 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-600">Ficha completa</p>
            <h2 className="mt-1 text-xl font-bold text-[#102a43]">{candidate.name}</h2>
            <p className="mt-1 text-sm text-slate-500">Entrevista e prosseguimento do cadastro</p>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-6 space-y-5">
          <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-5">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-full bg-cyan-100 text-sm font-bold text-cyan-700">1</span>
              <div><h3 className="font-bold text-[#102a43]">Dados da entrevista</h3><p className="text-xs text-slate-500">Informações preenchidas na primeira etapa</p></div>
            </div>
            <FieldList fields={interviewFields} />
            {candidate.rejectionReason && <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-3"><p className="text-xs font-bold text-rose-700">Motivo da reprovação</p><p className="mt-1 text-sm text-rose-800">{candidate.rejectionReason}</p></div>}
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">2</span>
              <div><h3 className="font-bold text-[#102a43]">Prosseguir cadastro</h3><p className="text-xs text-slate-500">Dados complementares para admissão e turma prevista</p></div>
            </div>
            <FieldList fields={registrationFields} />
          </section>
          <section className={`rounded-xl border p-4 ${candidate.documentationPending === "Sim" ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"}`}>
            <div className="flex items-start gap-3">
              <div className={`rounded-full p-2 ${candidate.documentationPending === "Sim" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{candidate.documentationPending === "Sim" ? <AlertCircle className="h-4 w-4" /> : <Check className="h-4 w-4" />}</div>
              <div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Documentação</p><p className="mt-1 text-sm font-semibold text-slate-700">{candidate.documentationPending === "Sim" ? "Pendência de documentação" : "Documentação regularizada"}</p>{candidate.documentationPending === "Sim" && candidate.documentationDetails && <p className="mt-1 text-sm text-slate-500">{candidate.documentationDetails}</p>}{candidate.documentationPending === "Sim" && <button type="button" onClick={onResolveDocumentation} className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"><Check className="h-3.5 w-3.5" />Marcar como resolvida</button>}</div>
            </div>
          </section>
          {onUpdateOperatorStatus && candidate.status === "Aprovado" && <section className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Situação do operador</p><div className="mt-3 grid gap-3 sm:grid-cols-2"><select value={operatorStatus} onChange={(event) => saveOperatorStatus(event.target.value as OperatorStatus)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700">{(["Ativo", "Desligado", "INSS", "Afastamento", "Desaparecido"] as OperatorStatus[]).map((status) => <option key={status}>{status}</option>)}</select>{operatorStatus === "Desligado" && <label className="text-xs font-semibold text-slate-600">Data de desligamento<input type="date" value={terminationDate} onChange={(event) => { setTerminationDate(event.target.value); saveOperatorStatus("Desligado", event.target.value); }} className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal" /></label>}</div></section>}
        </div>
        <button onClick={onClose} className="mt-7 w-full rounded-lg bg-[#102a43] px-4 py-2.5 text-sm font-semibold text-white">Fechar ficha</button>
      </div>
    </div>
  );
}

function InterviewModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: () => void;
}) {
  const [showRegistryManager, setShowRegistryManager] = useState(false);
  const [showEducationManager, setShowEducationManager] = useState(false);
  const [registries, setRegistries] = useState([
    "OPERADOR(A) COBRADOR(A)",
    "ESTAGIÁRIO",
    "NEGOCIADOR",
  ]);
  const [educations, setEducations] = useState([
    "Ensino fundamental",
    "Ensino médio",
    "Superior cursando",
    "Superior completo",
    "Pós-graduação",
  ]);
  const [newRegistry, setNewRegistry] = useState("");
  const [newEducation, setNewEducation] = useState("");
  const addRegistry = () => {
    const value = newRegistry.trim();
    if (value && !registries.includes(value)) {
      setRegistries((items) => [...items, value]);
      setNewRegistry("");
    }
  };
  const addEducation = () => {
    const value = newEducation.trim();
    if (value && !educations.includes(value)) {
      setEducations((items) => [...items, value]);
      setNewEducation("");
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-6">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 sm:px-7">
          <div>
            <h2 className="font-bold text-[#102a43]">
              Nova ficha de entrevista
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Preencha os dados básicos do candidato.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar formulário"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-6 p-5 sm:p-7">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-100 text-xs font-bold text-cyan-700">
                1
              </span>
              <h3 className="text-sm font-bold text-[#102a43]">
                Dados do candidato
              </h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nome completo" placeholder="Digite o nome" />
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="registro"
                    className="text-xs font-semibold text-slate-600"
                  >
                    Registro
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowRegistryManager((value) => !value)}
                    aria-label="Gerenciar opções de registro"
                    className="rounded-md p-1 text-slate-400 transition hover:bg-cyan-50 hover:text-cyan-600"
                  >
                    <Settings2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <select
                  id="registro"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                >
                  <option value="">Selecione o registro</option>
                  {registries.map((registry) => (
                    <option key={registry}>{registry}</option>
                  ))}
                </select>
                {showRegistryManager && (
                  <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-cyan-600">
                          Configurações
                        </p>
                        <p className="mt-1 text-sm font-bold text-[#102a43]">
                          Gerenciar registros
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Adicione ou remova opções disponíveis.
                        </p>
                      </div>
                      <button type="button" onClick={() => setShowRegistryManager(false)} aria-label="Fechar gerenciamento de registros" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={newRegistry}
                        onChange={(event) => setNewRegistry(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") addRegistry();
                        }}
                        placeholder="Nova opção"
                        className="h-9 min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-2.5 text-xs outline-none focus:border-cyan-500"
                      />
                      <button
                        type="button"
                        onClick={addRegistry}
                        className="rounded-md bg-[#102a43] px-3 text-xs font-bold text-white"
                      >
                        Adicionar
                      </button>
                    </div>
                    <div className="mt-2 space-y-1">
                      {registries.map((registry) => (
                        <div
                          key={registry}
                          className="flex items-center justify-between rounded-md bg-white px-2.5 py-1.5 text-xs text-slate-600"
                        >
                          <span>{registry}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setRegistries((items) =>
                                items.filter((item) => item !== registry),
                              )
                            }
                            aria-label={`Excluir ${registry}`}
                            className="text-rose-500 hover:text-rose-700"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <Field label="CPF" placeholder="000.000.000-00" />
              <Field
                label="Data de nascimento"
                placeholder="dd/mm/aaaa"
                type="date"
              />
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="escolaridade"
                    className="text-xs font-semibold text-slate-600"
                  >
                    Escolaridade
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowEducationManager((value) => !value)}
                    aria-label="Gerenciar opções de escolaridade"
                    className="rounded-md p-1 text-slate-400 transition hover:bg-cyan-50 hover:text-cyan-600"
                  >
                    <Settings2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <select
                  id="escolaridade"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Selecione a escolaridade
                  </option>
                  {educations.map((education) => (
                    <option key={education}>{education}</option>
                  ))}
                </select>
                {showEducationManager && (
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-cyan-600">
                          Configurações
                        </p>
                        <p className="mt-1 text-sm font-bold text-[#102a43]">
                          Gerenciar escolaridade
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Adicione ou remova opções disponíveis.
                        </p>
                      </div>
                      <button type="button" onClick={() => setShowEducationManager(false)} aria-label="Fechar gerenciamento de escolaridade" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mb-2 flex gap-2">
                      <input
                        value={newEducation}
                        onChange={(event) =>
                          setNewEducation(event.target.value)
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter") addEducation();
                        }}
                        placeholder="Nova escolaridade"
                        className="h-8 min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-2 text-xs outline-none focus:border-cyan-500"
                      />
                      <button
                        type="button"
                        onClick={addEducation}
                        className="rounded-md bg-[#102a43] px-3 text-xs font-bold text-white"
                      >
                        Adicionar
                      </button>
                    </div>
                    <div className="space-y-1">
                      {educations.map((education) => (
                        <div
                          key={education}
                          className="flex items-center justify-between rounded-md bg-white px-2.5 py-1.5 text-xs text-slate-600"
                        >
                          <span>{education}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setEducations((items) =>
                                items.filter((item) => item !== education),
                              )
                            }
                            aria-label={`Excluir ${education}`}
                            className="text-rose-500 hover:text-rose-700"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <label className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-600">
                  Antecedente criminal
                </span>
                <select
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Selecione uma opção
                  </option>
                  <option>Não possui</option>
                  <option>Possui</option>
                </select>
              </label>
              <Field label="Quantas conduções precisa?" placeholder="Ex.: 2" />
            </div>
          </div>
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                2
              </span>
              <h3 className="text-sm font-bold text-[#102a43]">
                Observações da entrevista
              </h3>
            </div>
            <textarea
              placeholder="Registre informações importantes sobre a entrevista..."
              className="min-h-24 w-full resize-y rounded-lg border border-slate-200 p-3 text-sm outline-none placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
            />
          </div>
          <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-5 sm:flex-row">
            <button
              onClick={onClose}
              className="h-10 rounded-lg px-4 text-sm font-semibold text-slate-500 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              onClick={onSave}
              className="h-10 rounded-lg bg-[#102a43] px-5 text-sm font-semibold text-white hover:bg-[#1c4465]"
            >
              Salvar ficha
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
