"use client";

import { FormEvent, useState } from "react";
import { supabase } from "../lib/supabase";

type Maid = {
  id: string;
  full_name: string;
  phone: string;
  city: string;
  area: string;
  locality: string | null;
  availability: string;
  experience_years: number;
  expected_salary: number | null;
  about: string | null;
  is_available: boolean;
  is_verified: boolean;
  is_approved: boolean;
};

export default function HomePage() {
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [service, setService] = useState("All");

  const [results, setResults] = useState<Maid[]>([]);
  const [searching, setSearching] = useState(false);

  const [registering, setRegistering] = useState(false);

  const searchMaids = async () => {
    setSearching(true);

    try {
      let query = supabase
        .from("maids")
        .select("*")
        .eq("is_available", true)
        .eq("is_approved", true);

      if (city.trim()) {
        query = query.ilike("city", `%${city.trim()}%`);
      }

      if (area.trim()) {
        query = query.ilike("area", `%${area.trim()}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error(error);
        alert("Unable to search the database.");
        return;
      }

      let filtered = data || [];

      // Filter service through maid_services
      if (service !== "All") {
        const { data: serviceData, error: serviceError } =
          await supabase
            .from("maid_services")
            .select("maid_id")
            .eq("service_type", service);

        if (serviceError) {
          console.error(serviceError);
          alert("Unable to load services.");
          return;
        }

        const maidIds = new Set(
          (serviceData || []).map((item) => item.maid_id)
        );

        filtered = filtered.filter((maid) =>
          maidIds.has(maid.id)
        );
      }

      setResults(filtered);
    } finally {
      setSearching(false);
    }
  };

  const registerMaid = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setRegistering(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const fullName =
      String(formData.get("fullName") || "").trim();

    const phone =
      String(formData.get("phone") || "").trim();

    const city =
      String(formData.get("city") || "").trim();

    const area =
      String(formData.get("area") || "").trim();

    const locality =
      String(formData.get("locality") || "").trim();

    const service =
      String(formData.get("service") || "");

    const availability =
      String(formData.get("availability") || "");

    const experience = Number(
      formData.get("experience") || 0
    );

    const salary = Number(
      formData.get("salary") || 0
    );

    const about =
      String(formData.get("about") || "").trim();

    try {
      // 1. Create maid profile
      const { data: maid, error } = await supabase
        .from("maids")
        .insert({
          full_name: fullName,
          phone,
          city,
          area,
          locality,
          availability,
          experience_years: experience,
          expected_salary: salary || null,
          about: about || null,

          is_available: true,
          is_verified: false,
          is_approved: true,
        })
        .select()
        .single();

      if (error) {
        console.error(error);
        alert(
          "Registration failed: " + error.message
        );
        return;
      }

      // 2. Save selected service
      const { error: serviceError } =
        await supabase
          .from("maid_services")
          .insert({
            maid_id: maid.id,
            service_type: service,
          });

      if (serviceError) {
        console.error(serviceError);

        // Remove maid if service couldn't be saved
        await supabase
          .from("maids")
          .delete()
          .eq("id", maid.id);

        alert(
          "Registration failed while saving service."
        );

        return;
      }

      alert(
        "Registration successful! Your profile will be reviewed."
      );

      form.reset();
    } finally {
      setRegistering(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* NAVBAR */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div>
            <h1 className="text-2xl font-bold text-pink-600">
              Maid_Near_You
            </h1>

            <p className="text-xs text-slate-500">
              Find domestic help near you
            </p>
          </div>

          <nav className="hidden gap-6 md:flex">
            <a href="#find" className="hover:text-pink-600">
              Find a Maid
            </a>

            <a
              href="#register"
              className="hover:text-pink-600"
            >
              Register as Maid
            </a>

            <a
              href="#how"
              className="hover:text-pink-600"
            >
              How It Works
            </a>
          </nav>

        </div>
      </header>

      {/* HERO */}
      <section className="bg-[#FFF4CC] px-6 py-20 text-slate-900">

        <div className="mx-auto max-w-5xl text-center">

          <p className="mb-4 font-medium">
            Simple • Local • Free to Start
          </p>

          <h2 className="text-4xl font-bold md:text-6xl">
            Find a Maid Near You
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Find cooks, cleaners and domestic helpers
            by city, area and locality.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">

            <a
              href="#find"
              className="rounded-xl bg-white px-7 py-3 font-semibold text-pink-600 shadow"
            >
              Find a Maid
            </a>

            <a
              href="#register"
              className="rounded-xl border border-white px-7 py-3 font-semibold"
            >
              Register as Maid
            </a>

          </div>

        </div>

      </section>

      {/* SEARCH */}
      <section
        id="find"
        className="bg-[#E9DDF7] px-6 py-16"
      >

        <div className="mx-auto max-w-6xl">

          <div className="mb-8 text-center">

            <h2 className="text-3xl font-bold">
              Find Domestic Help
            </h2>

            <p className="mt-2 text-slate-500">
              Search maids from our database
            </p>

          </div>

          <div className="grid gap-4 rounded-2xl bg-white p-6 shadow md:grid-cols-4">

            <input
              value={city}
              onChange={(e) =>
                setCity(e.target.value)
              }
              placeholder="City e.g. Jaipur"
              className="rounded-xl border px-4 py-3 outline-none focus:border-pink-500"
            />

            <input
              value={area}
              onChange={(e) =>
                setArea(e.target.value)
              }
              placeholder="Area / Locality"
              className="rounded-xl border px-4 py-3 outline-none focus:border-pink-500"
            />

            <select
              value={service}
              onChange={(e) =>
                setService(e.target.value)
              }
              className="rounded-xl border px-4 py-3"
            >
              <option value="All">
                All Services
              </option>

              <option value="Cook">
                Cook
              </option>

              <option value="Cleaner">
                Cleaner
              </option>

              <option value="Cook + Cleaner">
                Cook + Cleaner
              </option>

              <option value="Babysitter">
                Babysitter
              </option>

              <option value="Elder Care">
                Elder Care
              </option>

            </select>

            <button
              onClick={searchMaids}
              disabled={searching}
              className="rounded-xl bg-pink-600 px-5 py-3 font-semibold text-white hover:bg-pink-700 disabled:opacity-50"
            >
              {searching ? "Searching..." : "Search"}
            </button>

          </div>

          {/* RESULTS */}

          {results.length > 0 && (
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

              {results.map((maid) => (

                <div
                  key={maid.id}
                  className="rounded-2xl bg-white p-6 shadow"
                >

                  <div className="flex items-center gap-4">

                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-pink-100 text-xl font-bold text-pink-600">
                      {maid.full_name.charAt(0)}
                    </div>

                    <div>

                      <h3 className="text-xl font-bold">
                        {maid.full_name}
                      </h3>

                      <p className="text-pink-600">
                        Domestic Helper
                      </p>

                    </div>

                  </div>

                  <div className="mt-5 space-y-2 text-sm text-slate-600">

                    <p>
                      📍 {maid.area}, {maid.city}
                    </p>

                    {maid.locality && (
                      <p>
                        🏠 {maid.locality}
                      </p>
                    )}

                    <p>
                      ⏱ {maid.experience_years} years experience
                    </p>

                    <p>
                      🕐 {maid.availability}
                    </p>

                    {maid.expected_salary && (
                      <p>
                        💰 ₹{maid.expected_salary}
                      </p>
                    )}

                    {maid.is_verified && (
                      <p className="font-medium text-green-600">
                        ✓ Verified
                      </p>
                    )}

                  </div>

                  <a
                    href={`tel:${maid.phone}`}
                    className="mt-5 block rounded-xl bg-pink-600 px-4 py-3 text-center font-semibold text-white"
                  >
                    Contact Maid
                  </a>

                </div>

              ))}

            </div>
          )}

          {results.length === 0 && (
            <div className="mt-8 text-center text-slate-500">
              Search for a city and area to find available maids.
            </div>
          )}

        </div>

      </section>

      {/* REGISTER */}
      <section
        id="register"
        className="bg-[#DDF3EC] px-6 py-16"
      >

        <div className="mx-auto max-w-4xl">

          <div className="mb-8 text-center">

            <h2 className="text-3xl font-bold">
              Register as a Maid
            </h2>

            <p className="mt-2 text-slate-600">
              Create your free maid profile.
            </p>

          </div>

          <form
            onSubmit={registerMaid}
            className="grid gap-5 rounded-2xl bg-white p-6 shadow md:grid-cols-2"
          >

            <input
              name="fullName"
              required
              placeholder="Full Name"
              className="rounded-xl border px-4 py-3"
            />

            <input
              name="phone"
              required
              placeholder="Mobile Number"
              type="tel"
              className="rounded-xl border px-4 py-3"
            />

            <input
              name="city"
              required
              placeholder="City"
              className="rounded-xl border px-4 py-3"
            />

            <input
              name="area"
              required
              placeholder="Area"
              className="rounded-xl border px-4 py-3"
            />

            <input
              name="locality"
              placeholder="Locality"
              className="rounded-xl border px-4 py-3"
            />

            <select
              name="service"
              required
              className="rounded-xl border px-4 py-3"
            >
              <option value="Cook">
                Cook
              </option>

              <option value="Cleaner">
                Cleaner
              </option>

              <option value="Cook + Cleaner">
                Cook + Cleaner
              </option>

              <option value="Babysitter">
                Babysitter
              </option>

              <option value="Elder Care">
                Elder Care
              </option>
            </select>

            <select
              name="availability"
              required
              className="rounded-xl border px-4 py-3"
            >
              <option value="Part Time">
                Part Time
              </option>

              <option value="Full Time">
                Full Time
              </option>

              <option value="Both">
                Both
              </option>
            </select>

            <input
              name="experience"
              type="number"
              min="0"
              placeholder="Years of Experience"
              className="rounded-xl border px-4 py-3"
            />

            <input
              name="salary"
              type="number"
              min="0"
              placeholder="Expected Salary"
              className="rounded-xl border px-4 py-3"
            />

            <textarea
              name="about"
              placeholder="Tell us about your experience"
              className="min-h-28 rounded-xl border px-4 py-3 md:col-span-2"
            />

            <button
              type="submit"
              disabled={registering}
              className="rounded-xl bg-pink-600 px-5 py-3 font-semibold text-white hover:bg-pink-700 disabled:opacity-50 md:col-span-2"
            >
              {registering
                ? "Registering..."
                : "Create Free Profile"}
            </button>

          </form>

        </div>

      </section>

      {/* HOW IT WORKS */}
      <section
        id="how"
        className="bg-[#FCE4EC] px-6 py-16"
      >

        <div className="mx-auto max-w-6xl">

          <h2 className="text-center text-3xl font-bold">
            How Maid_Near_You Works
          </h2>

          <div className="mt-10 grid gap-6 md:grid-cols-3">

            {[
              {
                number: "1",
                title: "Register",
                text: "Maids create a free profile.",
              },
              {
                number: "2",
                title: "Search",
                text: "Customers search by locality and service.",
              },
              {
                number: "3",
                title: "Contact",
                text: "Customers can contact available maids directly.",
              },
            ].map((item) => (

              <div
                key={item.number}
                className="rounded-2xl bg-white p-7 text-center shadow"
              >

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-pink-600 font-bold text-white">
                  {item.number}
                </div>

                <h3 className="mt-5 text-xl font-bold">
                  {item.title}
                </h3>

                <p className="mt-2 text-slate-500">
                  {item.text}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 px-6 py-10 text-center text-slate-300">

        <h3 className="text-xl font-bold text-white">
          Maid_Near_You
        </h3>

        <p className="mt-2 text-sm">
          Connecting households with local domestic workers.
        </p>

        <p className="mt-6 text-xs">
          © {new Date().getFullYear()} Maid_Near_You
        </p>

      </footer>

    </main>
  );
}