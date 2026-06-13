import { useState, useEffect } from "react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { faker } from "@faker-js/faker";
import { Copy, Download, RefreshCw, FileJson, Table, Database, Settings, CheckSquare } from "lucide-react";

type DataType = 'users' | 'addresses' | 'companies' | 'products' | 'blogs' | 'social';
type FormatType = 'json' | 'csv' | 'sql' | 'yaml';

const CONFIG_FIELDS: Record<DataType, { key: string, label: string }[]> = {
  users: [
    { key: 'id', label: 'ID' },
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'username', label: 'Username' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'avatar', label: 'Avatar URL' }
  ],
  addresses: [
    { key: 'id', label: 'ID' },
    { key: 'street', label: 'Street' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'country', label: 'Country' },
    { key: 'zipCode', label: 'Zip Code' }
  ],
  companies: [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Company Name' },
    { key: 'industry', label: 'Industry' },
    { key: 'website', label: 'Website' },
    { key: 'catchPhrase', label: 'Catch Phrase' }
  ],
  products: [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Product Name' },
    { key: 'price', label: 'Price' },
    { key: 'sku', label: 'SKU' },
    { key: 'category', label: 'Category' },
    { key: 'description', label: 'Description' },
    { key: 'image', label: 'Image URL' }
  ],
  blogs: [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title' },
    { key: 'excerpt', label: 'Excerpt' },
    { key: 'author', label: 'Author' },
    { key: 'tags', label: 'Tags' },
    { key: 'date', label: 'Published Date' }
  ],
  social: [
    { key: 'id', label: 'ID' },
    { key: 'username', label: 'Username' },
    { key: 'bio', label: 'Bio' },
    { key: 'followers', label: 'Followers' },
    { key: 'following', label: 'Following' }
  ]
};

const DEFAULT_FIELDS: Record<DataType, Record<string, boolean>> = {
  users: { id: true, firstName: true, lastName: true, username: true, email: true, phone: true, avatar: true },
  addresses: { id: true, street: true, city: true, state: true, country: true, zipCode: true },
  companies: { id: true, name: true, industry: true, website: true, catchPhrase: true },
  products: { id: true, name: true, price: true, sku: true, category: true, description: false, image: false },
  blogs: { id: true, title: true, excerpt: true, author: true, tags: true, date: false },
  social: { id: true, username: true, bio: true, followers: true, following: true },
};

export function TestDataGeneratorTool() {
  const [dataType, setDataType] = useState<DataType>('users');
  const [count, setCount] = useState<number>(10);
  const [format, setFormat] = useState<FormatType>('json');
  const [output, setOutput] = useState("");
  
  const [fields, setFields] = useState<Record<DataType, Record<string, boolean>>>(DEFAULT_FIELDS);
  const [productCategory, setProductCategory] = useState<string>('All');

  const toggleField = (type: DataType, key: string) => {
    setFields(prev => ({
       ...prev,
       [type]: {
          ...prev[type],
          [key]: !prev[type][key]
       }
    }));
  };

  const generateData = () => {
    faker.seed(Date.now()); // ensure fresh data
    const results = [];
    
    for (let i = 0; i < count; i++) {
       const item: any = {};
       const fl = fields[dataType];

       switch(dataType) {
          case 'users':
             if (fl.id) item.id = faker.string.uuid();
             if (fl.firstName) item.firstName = faker.person.firstName();
             if (fl.lastName) item.lastName = faker.person.lastName();
             if (fl.username) item.username = faker.internet.username();
             if (fl.email) item.email = faker.internet.email();
             if (fl.phone) item.phone = faker.phone.number();
             if (fl.avatar) item.avatar = faker.image.avatar();
             break;
          case 'addresses':
             if (fl.id) item.id = faker.string.uuid();
             if (fl.street) item.street = faker.location.streetAddress();
             if (fl.city) item.city = faker.location.city();
             if (fl.state) item.state = faker.location.state();
             if (fl.country) item.country = faker.location.country();
             if (fl.zipCode) item.zipCode = faker.location.zipCode();
             break;
          case 'companies':
             if (fl.id) item.id = faker.string.uuid();
             if (fl.name) item.name = faker.company.name();
             if (fl.industry) item.industry = faker.company.buzzNoun();
             if (fl.website) item.website = faker.internet.url();
             if (fl.catchPhrase) item.catchPhrase = faker.company.catchPhrase();
             break;
          case 'products': {
             const cat = productCategory === 'All' ? faker.commerce.department() : productCategory;
             
             // slightly tailored product names based on category
             let pName = faker.commerce.productName();
             if (productCategory === 'Electronics') {
                const types = ['Laptop', 'Smartphone', 'Tablet', 'Monitor', 'Keyboard', 'Headphones', 'Camera'];
                pName = `${faker.commerce.productAdjective()} ${types[faker.number.int({max: types.length-1})]}`;
             } else if (productCategory === 'Clothing') {
                const types = ['T-Shirt', 'Jeans', 'Jacket', 'Sneakers', 'Hat', 'Socks', 'Dress'];
                pName = `${faker.commerce.productAdjective()} ${types[faker.number.int({max: types.length-1})]}`;
             }

             if (fl.id) item.id = faker.string.uuid();
             if (fl.name) item.name = pName;
             if (fl.price) item.price = parseFloat(faker.commerce.price());
             if (fl.sku) item.sku = faker.string.alphanumeric(8).toUpperCase();
             if (fl.category) item.category = cat;
             if (fl.description) item.description = faker.commerce.productDescription();
             if (fl.image) item.image = faker.image.url();
             break;
          }
          case 'blogs':
             if (fl.id) item.id = faker.string.uuid();
             if (fl.title) item.title = faker.lorem.sentence();
             if (fl.excerpt) item.excerpt = faker.lorem.paragraph();
             if (fl.author) item.author = faker.person.fullName();
             if (fl.tags) item.tags = [faker.word.sample(), faker.word.sample()];
             if (fl.date) item.date = faker.date.recent().toISOString();
             break;
          case 'social':
             if (fl.id) item.id = faker.string.uuid();
             if (fl.username) item.username = faker.internet.username();
             if (fl.bio) item.bio = faker.person.bio();
             if (fl.followers) item.followers = faker.number.int({ min: 0, max: 100000 });
             if (fl.following) item.following = faker.number.int({ min: 0, max: 2000 });
             break;
       }
       
       if (Object.keys(item).length > 0) {
          results.push(item);
       }
    }

    let finalOutput = "";
    if (format === 'json') {
       finalOutput = JSON.stringify(results, null, 2);
    } else if (format === 'csv') {
       if (results.length > 0) {
          const headers = Object.keys(results[0]).join(',');
          const rows = results.map(row => 
             Object.values(row).map(v => 
                typeof v === 'string' && (v.includes(',') || v.includes('\n')) ? `"${v}"` : v
             ).join(',')
          ).join('\n');
          finalOutput = `${headers}\n${rows}`;
       }
    } else if (format === 'sql') {
       if (results.length > 0) {
          const tableName = dataType;
          const headers = Object.keys(results[0]);
          const insertStatements = results.map(row => {
             const values = Object.values(row).map(v => {
                if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`;
                if (Array.isArray(v)) return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
                return v;
             }).join(', ');
             return `INSERT INTO ${tableName} (${headers.join(', ')}) VALUES (${values});`;
          }).join('\n');
          finalOutput = insertStatements;
       }
    } else if (format === 'yaml') {
       finalOutput = results.map(row => {
          let yml = "-\n";
          for (const [k, v] of Object.entries(row)) {
             if (Array.isArray(v)) {
                yml += `  ${k}:\n` + v.map(item => `    - ${item}`).join('\n') + '\n';
             } else {
                yml += `  ${k}: ${v}\n`;
             }
          }
          return yml;
       }).join('');
    }

    setOutput(finalOutput || "No fields selected.");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
  };

  const downloadFile = () => {
    const extRef: Record<FormatType, string> = { json: 'json', csv: 'csv', sql: 'sql', yaml: 'yaml' };
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mock-data-${dataType}.${extRef[format]}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-[#111111] font-sans flex flex-col">
      <TopNav />
      <main className="flex-1 max-w-7xl w-full mx-auto px-5 py-10 md:py-14">
        <div className="max-w-2xl">
          <h1 className="m-0 font-extrabold text-3xl md:text-4xl tracking-[-0.03em]">Test Data Generator</h1>
          <p className="mt-3 text-[16px] text-[#111111]/60 leading-relaxed">
            Generate highly realistic mock data for databases, UI mocking, and automated tests. Customize fields and output format.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
          <aside className="border border-[#111111] bg-white rounded-sm p-4 lg:sticky top-6">
            <h2 className="font-extrabold text-[15px] mb-4 flex items-center gap-2 border-b border-[#111111]/10 pb-3">
              <Settings className="w-[16px] h-[16px]" /> Configuration
            </h2>
            
            <div className="flex flex-col gap-4">
               <div>
                  <label className="block font-mono text-[11px] uppercase font-bold text-[#111111] mb-1.5">Data Entity</label>
                  <select 
                     value={dataType} 
                     onChange={e => setDataType(e.target.value as DataType)}
                     className="w-full px-3 py-2 border border-[#111111] bg-[#FAFAFA] text-[14px] font-semibold rounded-sm focus:outline-none focus:ring-2 focus:ring-[#FFD400]"
                  >
                     <option value="users">User Profiles</option>
                     <option value="addresses">Addresses</option>
                     <option value="companies">Companies</option>
                     <option value="products">Ecommerce Products</option>
                     <option value="blogs">Blog Posts</option>
                     <option value="social">Social Media</option>
                  </select>
               </div>

               {dataType === 'products' && (
                  <div>
                     <label className="block font-mono text-[11px] uppercase font-bold text-[#111111] mb-1.5">Product Category</label>
                     <select 
                        value={productCategory} 
                        onChange={e => setProductCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-[#111111] bg-[#FAFAFA] text-[14px] rounded-sm focus:outline-none focus:ring-2 focus:ring-[#FFD400]"
                     >
                        <option value="All">All Categories (Mixed)</option>
                        <option value="Electronics">Electronics & Tech</option>
                        <option value="Clothing">Clothing & Apparel</option>
                        <option value="Home">Home & Garden</option>
                        <option value="Software">Digital & Software</option>
                     </select>
                  </div>
               )}

               <div className="border-t border-b border-[#111111]/10 py-4 -mx-4 px-4 bg-[#FAFAFA]">
                  <label className="block font-mono text-[11px] uppercase font-bold text-[#111111] mb-2">Fields to Include</label>
                  <div className="flex flex-col gap-2">
                     {CONFIG_FIELDS[dataType].map(f => (
                        <label key={f.key} className="flex items-center gap-2 cursor-pointer group">
                           <input 
                              type="checkbox" 
                              checked={fields[dataType][f.key] || false}
                              onChange={() => toggleField(dataType, f.key)}
                              className="peer sr-only"
                           />
                           <div className="w-[18px] h-[18px] border-[1.5px] border-[#111111] rounded-[2px] peer-checked:bg-[#FFD400] peer-checked:border-[#111111] flex items-center justify-center transition-colors">
                              {fields[dataType][f.key] && <CheckSquare className="w-3.5 h-3.5" />}
                           </div>
                           <span className="text-[13px] font-semibold text-[#111111]/80 group-hover:text-[#111111] transition-colors">
                              {f.label}
                           </span>
                        </label>
                     ))}
                  </div>
               </div>

               <div>
                  <label className="block font-mono text-[11px] uppercase font-bold text-[#111111] mb-1.5">Number of Records</label>
                  <select 
                     value={count} 
                     onChange={e => setCount(parseInt(e.target.value))}
                     className="w-full px-3 py-2 border border-[#111111] bg-[#FAFAFA] text-[14px] rounded-sm focus:outline-none focus:ring-2 focus:ring-[#FFD400]"
                  >
                     <option value={1}>1 Record</option>
                     <option value={10}>10 Records</option>
                     <option value={50}>50 Records</option>
                     <option value={100}>100 Records</option>
                     <option value={1000}>1000 Records</option>
                  </select>
               </div>

               <div>
                  <label className="block font-mono text-[11px] uppercase font-bold text-[#111111] mb-1.5">Output Format</label>
                  <select 
                     value={format} 
                     onChange={e => setFormat(e.target.value as FormatType)}
                     className="w-full px-3 py-2 border border-[#111111] bg-[#FAFAFA] text-[14px] rounded-sm focus:outline-none focus:ring-2 focus:ring-[#FFD400]"
                  >
                     <option value="json">JSON</option>
                     <option value="csv">CSV</option>
                     <option value="sql">SQL Inserts</option>
                     <option value="yaml">YAML</option>
                  </select>
               </div>

               <button 
                 onClick={generateData}
                 className="mt-2 w-full bg-[#FFD400] text-[#111111] font-bold text-[14px] py-2.5 border border-[#111111] rounded-sm hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_#111111] transition-all flex items-center justify-center gap-2"
               >
                 <RefreshCw className="w-4 h-4" /> Generate
               </button>
            </div>
          </aside>

          <div className="flex-1 flex flex-col border border-[#111111] rounded-sm bg-white overflow-hidden min-h-[600px] h-full shadow-[4px_4px_0px_rgba(0,0,0,0.05)]">
            <div className="h-[46px] flex-none border-b border-[#111111] flex items-center justify-between px-3 bg-[#FAFAFA]">
               <div className="flex items-center gap-2 font-mono text-[13px] font-bold text-[#111111]/80">
                  {format === 'json' && <FileJson className="w-4 h-4 text-[#111111]/70" />}
                  {format === 'csv' && <Table className="w-4 h-4 text-[#111111]/70" />}
                  {format === 'sql' && <Database className="w-4 h-4 text-[#111111]/70" />}
                  {format === 'yaml' && <FileJson className="w-4 h-4 text-[#111111]/70" />}
                  Output: mock-data-{dataType}.{format}
               </div>
               <div className="flex gap-2">
                 <button onClick={copyToClipboard} className="flex items-center gap-1.5 px-3 py-1 text-[12px] font-bold border border-[#111111] bg-white rounded-sm hover:bg-[#FFD400] transition-colors">
                   <Copy className="w-3.5 h-3.5" /> Copy
                 </button>
                 <button onClick={downloadFile} className="flex items-center gap-1.5 px-3 py-1 text-[12px] font-bold border border-[#111111] bg-white rounded-sm hover:bg-[#FFD400] transition-colors">
                   <Download className="w-3.5 h-3.5" /> Download
                 </button>
               </div>
            </div>
            <textarea
               value={output}
               readOnly
               placeholder="Configure your fields and click Generate to create mock data..."
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
