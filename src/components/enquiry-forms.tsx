import { useMemo, useState, type FormEvent } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { saveEnquiry, type EnquiryKind } from "@/lib/enquiries";
import {
  interests,
  kindLabels,
  materials,
  nextVisitDays,
  visitTimes,
  type Material,
} from "@/lib/site";
import { cn } from "@/lib/utils";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-muted">{message}</p>;
}


async function sendToDesk(payload: Record<string, string>) {
  try {
    await fetch("/api/desk/enquiry", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // Guest still sees confirmation. Desk will miss it only if the server is down.
  }
}

function emailOk(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function VisitForm() {
  const days = useMemo(() => nextVisitDays(), []);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState(format(days[0]!, "yyyy-MM-dd"));
  const [time, setTime] = useState<string>(visitTimes[0]);
  const [picked, setPicked] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  function toggle(id: string) {
    setPicked((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Please add your name.";
    if (!emailOk(email)) next.email = "A valid email helps us confirm.";
    if (!phone.trim()) next.phone = "A phone number is useful on the day.";
    if (!date) next.date = "Choose a day.";
    setErrors(next);
    if (Object.keys(next).length) return;

    saveEnquiry({
      kind: "visit",
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      date,
      time,
      interests: picked,
      message: message.trim() || undefined,
    });
    void sendToDesk({
      kind: "visit",
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      date,
      time,
      interests: picked.join(", "),
      message: message.trim(),
    });
    setDone(true);
    toast.success("Visit requested — we will confirm by email.");
  }

  if (done) {
    return (
      <Confirmation
        kind="visit"
        title="We have your visit."
        body={`We’ll confirm ${format(new Date(`${date}T00:00:00`), "EEEE d MMMM")} at ${time}. If you need to change it, reply to the email.`}
      />
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="visit-name">Name</Label>
          <Input
            id="visit-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
          <FieldError message={errors.name} />
        </div>
        <div>
          <Label htmlFor="visit-phone">Phone</Label>
          <Input
            id="visit-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
          />
          <FieldError message={errors.phone} />
        </div>
      </div>
      <div>
        <Label htmlFor="visit-email">Email</Label>
        <Input
          id="visit-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <FieldError message={errors.email} />
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-fg">Day</legend>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {days.map((d) => {
            const value = format(d, "yyyy-MM-dd");
            const active = date === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setDate(value)}
                className={cn(
                  "h-14 rounded-md px-3 text-left text-sm transition-colors duration-150",
                  active
                    ? "bg-accent text-accent-fg"
                    : "bg-surface text-fg shadow-border hover:bg-bg-elevated",
                )}
              >
                <span className="block text-xs opacity-80">
                  {format(d, "EEE")}
                </span>
                {format(d, "d MMM")}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium text-fg">Time</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {visitTimes.map((t) => {
            const saturday = new Date(`${date}T00:00:00`).getDay() === 6;
            const disabled = saturday && t === "15:00";
            const active = time === t;
            return (
              <button
                key={t}
                type="button"
                disabled={disabled}
                onClick={() => setTime(t)}
                className={cn(
                  "h-11 min-w-20 rounded-md px-4 text-sm transition-colors duration-150 disabled:opacity-30",
                  active
                    ? "bg-accent text-accent-fg"
                    : "bg-surface text-fg shadow-border hover:bg-bg-elevated",
                )}
              >
                {t}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium text-fg">
          What would you like to see?
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {interests.map((item) => {
            const active = picked.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggle(item.id)}
                className={cn(
                  "h-11 rounded-full px-4 text-sm transition-colors duration-150",
                  active
                    ? "bg-accent text-accent-fg"
                    : "bg-surface text-fg shadow-border hover:bg-bg-elevated",
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <Label htmlFor="visit-notes">Notes (optional)</Label>
        <Textarea
          id="visit-notes"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Suburb, builder, or rooms you are working on."
        />
      </div>

      <Button type="submit" size="lg">
        Request this visit
      </Button>
    </form>
  );
}

export function QuoteForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [suburb, setSuburb] = useState("");
  const [projectType, setProjectType] = useState("Renovation");
  const [picked, setPicked] = useState<string[]>(["whole-home"]);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  function toggle(id: string) {
    setPicked((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Please add your name.";
    if (!emailOk(email)) next.email = "A valid email helps us reply.";
    if (!phone.trim()) next.phone = "A phone number is useful.";
    if (!suburb.trim()) next.suburb = "Which suburb is the project in?";
    setErrors(next);
    if (Object.keys(next).length) return;

    saveEnquiry({
      kind: "quote",
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      suburb: suburb.trim(),
      projectType,
      interests: picked,
      message: message.trim() || undefined,
    });
    void sendToDesk({
      kind: "quote",
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      suburb: suburb.trim(),
      interests: picked.join(", "),
      message: [projectType, message.trim()].filter(Boolean).join(" — "),
    });
    setDone(true);
    toast.success("Enquiry received — we will be in touch.");
  }

  if (done) {
    return (
      <Confirmation
        kind="quote"
        title="Thank you."
        body="A designer will read this and come back with a showroom time, or a site visit if the drawings are far enough along."
      />
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="q-name">Name</Label>
          <Input
            id="q-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
          <FieldError message={errors.name} />
        </div>
        <div>
          <Label htmlFor="q-phone">Phone</Label>
          <Input
            id="q-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
          />
          <FieldError message={errors.phone} />
        </div>
      </div>
      <div>
        <Label htmlFor="q-email">Email</Label>
        <Input
          id="q-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <FieldError message={errors.email} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="q-suburb">Suburb</Label>
          <Input
            id="q-suburb"
            value={suburb}
            onChange={(e) => setSuburb(e.target.value)}
            placeholder="Hawthorn, Kew, Brighton…"
          />
          <FieldError message={errors.suburb} />
        </div>
        <div>
          <Label htmlFor="q-type">Project</Label>
          <Select
            id="q-type"
            value={projectType}
            onChange={(e) => setProjectType(e.target.value)}
          >
            <option>Renovation</option>
            <option>New build</option>
            <option>Apartment</option>
            <option>Weekender</option>
            <option>Commercial / hospitality</option>
          </Select>
        </div>
      </div>
      <fieldset>
        <legend className="text-sm font-medium text-fg">Scope</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {interests.map((item) => {
            const active = picked.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggle(item.id)}
                className={cn(
                  "h-11 rounded-full px-4 text-sm transition-colors duration-150",
                  active
                    ? "bg-accent text-accent-fg"
                    : "bg-surface text-fg shadow-border hover:bg-bg-elevated",
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </fieldset>
      <div>
        <Label htmlFor="q-notes">Tell us about the rooms</Label>
        <Textarea
          id="q-notes"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Kitchen, floors through the living level, a deck off the back — whatever you already know."
        />
      </div>
      <Button type="submit" size="lg">
        Send enquiry
      </Button>
      <p className="text-sm text-subtle">
        If you are specifying with a builder, include their name and any
        drawings. We will send a sample set to the site or the office.
      </p>
    </form>
  );
}

export function SampleForm({ selected }: { selected: Material[] }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [suburb, setSuburb] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Please add your name.";
    if (!emailOk(email)) next.email = "A valid email helps us send samples.";
    if (!phone.trim()) next.phone = "A phone number is useful.";
    if (!suburb.trim()) next.suburb = "Where should we send them?";
    if (!selected.length) next.materials = "Select at least one sample.";
    setErrors(next);
    if (Object.keys(next).length) return;

    saveEnquiry({
      kind: "sample",
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      suburb: suburb.trim(),
      interests: [],
      materials: selected.map((m) => m.id),
    });
    void sendToDesk({
      kind: "sample",
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      suburb: suburb.trim(),
      materials: selected.map((m) => m.name).join(", "),
    });
    setDone(true);
    toast.success("Sample request received.");
  }

  if (done) {
    return (
      <Confirmation
        kind="sample"
        title="Samples are on the list."
        body="We’ll pack a small set and be in touch about collection from Cremorne, or delivery if you are further out."
      />
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {selected.length ? (
        <ul className="flex flex-wrap gap-2">
          {selected.map((m) => (
            <li
              key={m.id}
              className="rounded-full bg-bg-elevated px-3 py-1 text-sm text-fg"
            >
              {m.name}
              <span className="text-subtle"> · {kindLabels[m.kind]}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">
          Select boards from the library, then send this through.
        </p>
      )}
      <FieldError message={errors.materials} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="s-name">Name</Label>
          <Input
            id="s-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <FieldError message={errors.name} />
        </div>
        <div>
          <Label htmlFor="s-phone">Phone</Label>
          <Input
            id="s-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <FieldError message={errors.phone} />
        </div>
      </div>
      <div>
        <Label htmlFor="s-email">Email</Label>
        <Input
          id="s-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FieldError message={errors.email} />
      </div>
      <div>
        <Label htmlFor="s-suburb">Suburb</Label>
        <Input
          id="s-suburb"
          value={suburb}
          onChange={(e) => setSuburb(e.target.value)}
        />
        <FieldError message={errors.suburb} />
      </div>
      <Button type="submit" size="lg" disabled={!selected.length}>
        Request samples
      </Button>
    </form>
  );
}

function Confirmation({
  title,
  body,
  kind,
}: {
  title: string;
  body: string;
  kind: EnquiryKind;
}) {
  return (
    <div className="rounded-xl bg-bg-elevated p-6 md:p-8">
      <p className="text-sm tracking-wide text-muted">
        {kind === "visit"
          ? "Showroom visit"
          : kind === "sample"
            ? "Samples"
            : "Project enquiry"}
      </p>
      <h3 className="mt-2 font-display text-3xl font-medium tracking-tight text-fg">
        {title}
      </h3>
      <p className="mt-3 max-w-md text-muted">{body}</p>
    </div>
  );
}

export { materials };
