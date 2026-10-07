import { useState } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { faker } from "@faker-js/faker";
import { Copy, Download, RefreshCw, Webhook, Check } from "lucide-react";

type Category = "store" | "school" | "football" | "employees" | "users";

const CATEGORIES: { id: Category; label: string; noun: string; hint: string }[] = [
  { id: "store", label: "Store", noun: "products", hint: "A store with a product catalog, each product carrying tags and customer reviews." },
  { id: "school", label: "School", noun: "students", hint: "A school with teachers and a student roster, each student with grades and activities." },
  { id: "football", label: "Football Team", noun: "players", hint: "A league and team with a coach, plus a squad of players and their season stats." },
  { id: "employees", label: "Employees", noun: "employees", hint: "A company with departments and a staff list, each employee with contact details." },
  { id: "users", label: "Organization Users", noun: "users", hint: "An organization with a user list, each user carrying roles and permissions." },
];

const id = () => faker.string.uuid();

function generateStore(count: number) {
  return {
    store: {
      id: id(),
      name: `${faker.company.name()} Store`,
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        country: faker.location.country(),
        zipCode: faker.location.zipCode(),
      },
      rating: faker.number.float({ min: 3, max: 5, fractionDigits: 1 }),
    },
    products: Array.from({ length: count }, () => ({
      id: id(),
      name: faker.commerce.productName(),
      price: parseFloat(faker.commerce.price()),
      currency: "USD",
      category: faker.commerce.department(),
      inStock: faker.datatype.boolean(),
      tags: faker.helpers.arrayElements(
        ["new", "sale", "bestseller", "limited", "eco-friendly", "trending"],
        { min: 1, max: 3 }
      ),
      reviews: Array.from({ length: faker.number.int({ min: 0, max: 4 }) }, () => ({
        user: faker.person.fullName(),
        rating: faker.number.int({ min: 1, max: 5 }),
        comment: faker.lorem.sentence(),
      })),
    })),
  };
}

function generateSchool(count: number) {
  const subjects = ["Mathematics", "Science", "English", "History", "Art", "Physical Education"];
  const activities = ["Chess Club", "Football", "Debate Team", "Drama Club", "Robotics", "Choir"];
  return {
    school: {
      id: id(),
      name: `${faker.location.city()} High School`,
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        country: faker.location.country(),
      },
      founded: faker.number.int({ min: 1950, max: 2015 }),
    },
    teachers: Array.from({ length: faker.number.int({ min: 2, max: 4 }) }, () => ({
      id: id(),
      name: faker.person.fullName(),
      subject: faker.helpers.arrayElement(subjects),
      email: faker.internet.email(),
    })),
    students: Array.from({ length: count }, () => ({
      id: id(),
      name: faker.person.fullName(),
      age: faker.number.int({ min: 11, max: 18 }),
      grade: faker.number.int({ min: 6, max: 12 }),
      grades: {
        math: faker.number.int({ min: 50, max: 100 }),
        science: faker.number.int({ min: 50, max: 100 }),
        english: faker.number.int({ min: 50, max: 100 }),
      },
      activities: faker.helpers.arrayElements(activities, { min: 0, max: 3 }),
    })),
  };
}

function generateFootball(count: number) {
  const positions = ["Goalkeeper", "Defender", "Midfielder", "Forward"];
  return {
    league: {
      id: id(),
      name: `${faker.location.country()} Premier League`,
      season: `${faker.date.past().getFullYear()}/${faker.date.past().getFullYear() + 1}`,
    },
    team: {
      id: id(),
      name: `${faker.location.city()} ${faker.helpers.arrayElement(["United", "City", "Rovers", "Athletic", "FC"])}`,
      stadium: `${faker.person.lastName()} Stadium`,
      founded: faker.number.int({ min: 1880, max: 1990 }),
      coach: {
        id: id(),
        name: faker.person.fullName(),
        nationality: faker.location.country(),
      },
    },
    players: Array.from({ length: count }, () => ({
      id: id(),
      name: faker.person.fullName(),
      position: faker.helpers.arrayElement(positions),
      number: faker.number.int({ min: 1, max: 99 }),
      nationality: faker.location.country(),
      stats: {
        appearances: faker.number.int({ min: 0, max: 40 }),
        goals: faker.number.int({ min: 0, max: 30 }),
        assists: faker.number.int({ min: 0, max: 20 }),
      },
    })),
  };
}

function generateEmployees(count: number) {
  const departmentNames = ["Engineering", "Sales", "Marketing", "Human Resources", "Finance", "Support"];
  const skills = ["JavaScript", "Python", "Communication", "Leadership", "SQL", "Project Management", "Design", "Sales"];
  const departments = faker.helpers.arrayElements(departmentNames, { min: 3, max: 5 }).map((name) => ({
    id: id(),
    name,
    manager: { id: id(), name: faker.person.fullName(), email: faker.internet.email() },
  }));

  return {
    company: {
      id: id(),
      name: faker.company.name(),
      industry: faker.company.buzzNoun(),
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        country: faker.location.country(),
      },
    },
    departments,
    employees: Array.from({ length: count }, () => ({
      id: id(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: faker.person.jobTitle(),
      department: faker.helpers.arrayElement(departments).name,
      salary: faker.number.int({ min: 40000, max: 180000 }),
      skills: faker.helpers.arrayElements(skills, { min: 2, max: 4 }),
      contact: {
        phone: faker.phone.number(),
        address: {
          city: faker.location.city(),
          country: faker.location.country(),
        },
      },
    })),
  };
}

function generateUsers(count: number) {
  const roles = ["admin", "editor", "viewer", "member"];
  const permissions = ["read", "write", "delete", "invite", "billing", "admin"];
  return {
    organization: {
      id: id(),
      name: faker.company.name(),
      website: faker.internet.url(),
      plan: faker.helpers.arrayElement(["Free", "Pro", "Team", "Enterprise"]),
    },
    users: Array.from({ length: count }, () => ({
      id: id(),
      name: faker.person.fullName(),
      username: faker.internet.username(),
      email: faker.internet.email(),
      role: faker.helpers.arrayElement(roles),
      isActive: faker.datatype.boolean(),
      permissions: faker.helpers.arrayElements(permissions, { min: 1, max: 4 }),
      address: {
        city: faker.location.city(),
        country: faker.location.country(),
      },
      lastLogin: faker.date.recent().toISOString(),
    })),
  };
}

const GENERATORS: Record<Category, (count: number) => unknown> = {
  store: generateStore,
  school: generateSchool,
  football: generateFootball,
  employees: generateEmployees,
  users: generateUsers,
};

export function MockApiGeneratorTool() {
  const [category, setCategory] = useState<Category>("store");
  const [count, setCount] = useState(10);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const active = CATEGORIES.find((c) => c.id === category)!;

  const generate = () => {
    faker.seed(Date.now());
    const data = GENERATORS[category](count);
    setOutput(JSON.stringify(data, null, 2));
  };

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mock-api-${category}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-[#111111] font-sans flex flex-col">
      <TopNav />
      <main className="flex-1 max-w-7xl w-full mx-auto px-5 py-10 md:py-14">
        <div className="max-w-2xl">
          <h1 className="m-0 font-extrabold text-3xl md:text-4xl tracking-[-0.03em]">Mock API Generator</h1>
          <p className="mt-3 text-[16px] text-[#111111]/60 leading-relaxed">
            Generate realistic, nested JSON like a real API would return — objects inside arrays, arrays inside objects — so you can practice parsing responses without needing a live API.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
          <aside className="border border-[#111111] bg-white rounded-sm p-4 lg:sticky top-6">
            <h2 className="font-extrabold text-[15px] mb-4 flex items-center gap-2 border-b border-[#111111]/10 pb-3">
              <Webhook className="w-[16px] h-[16px]" /> Configuration
            </h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block font-mono text-[11px] uppercase font-bold text-[#111111] mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full px-3 py-2 border border-[#111111] bg-[#FAFAFA] text-[14px] font-semibold rounded-sm focus:outline-none focus:ring-2 focus:ring-[#FFD400]"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
                <p className="mt-2 text-[12px] text-[#111111]/55 leading-relaxed">{active.hint}</p>
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase font-bold text-[#111111] mb-1.5">
                  Number of {active.noun}
                </label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={count}
                  onChange={(e) => setCount(Math.max(1, Math.min(500, parseInt(e.target.value) || 1)))}
                  className="w-full px-3 py-2 border border-[#111111] bg-[#FAFAFA] text-[14px] rounded-sm focus:outline-none focus:ring-2 focus:ring-[#FFD400]"
                />
              </div>

              <button
                onClick={generate}
                className="mt-2 w-full bg-[#FFD400] text-[#111111] font-bold text-[14px] py-2.5 border border-[#111111] rounded-sm hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_#111111] transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Generate
              </button>
            </div>
          </aside>

          <div className="flex-1 flex flex-col border border-[#111111] rounded-sm bg-white overflow-hidden min-h-[600px] h-full shadow-[4px_4px_0px_rgba(0,0,0,0.05)]">
            <div className="h-[46px] flex-none border-b border-[#111111] flex items-center justify-between px-3 bg-[#FAFAFA]">
              <div className="flex items-center gap-2 font-mono text-[13px] font-bold text-[#111111]/80">
                <Webhook className="w-4 h-4 text-[#111111]/70" />
                Output: mock-api-{category}.json
              </div>
              <div className="flex gap-2">
                <button onClick={copyToClipboard} className="flex items-center gap-1.5 px-3 py-1 text-[12px] font-bold border border-[#111111] bg-white rounded-sm hover:bg-[#FFD400] transition-colors">
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} {copied ? "Copied" : "Copy"}
                </button>
                <button onClick={downloadFile} className="flex items-center gap-1.5 px-3 py-1 text-[12px] font-bold border border-[#111111] bg-white rounded-sm hover:bg-[#FFD400] transition-colors">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="Pick a category and click Generate to create a realistic, nested mock API response..."
              className="flex-1 w-full bg-white font-mono text-[13px] leading-relaxed text-[#111111] p-5 resize-none outline-none"
              spellCheck={false}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
