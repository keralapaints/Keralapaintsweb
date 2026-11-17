import "server-only";
import { outlets as fallbackOutlets, type Outlet, type OutletType } from "@/data/outlets";
import { connectDB, hasDatabase } from "./db";
import { OutletModel } from "./models/Outlet";

/** An outlet as the admin sees it: the website's fields plus its id, order and visibility. */
export type AdminOutlet = Outlet & { id: string; order: number; published: boolean; updatedAt?: string };

type OutletRecord = {
  _id: unknown; district: string; type: string; name?: string | null; place: string; address: string;
  pin?: string | null; phones?: string[]; isNew?: boolean | null; published?: boolean | null; order?: number | null;
  updatedAt?: Date | null;
};

const toOutlet = (doc: OutletRecord): Outlet => ({
  district: doc.district,
  type: doc.type as OutletType,
  ...(doc.name ? { name: doc.name } : {}),
  place: doc.place,
  address: doc.address,
  ...(doc.pin ? { pin: doc.pin } : {}),
  phones: doc.phones ?? [],
  ...(doc.isNew ? { isNew: true } : {}),
});

/**
 * The outlets for the public /outlets/ page, in display order. Without a database (MONGODB_URI not set), or if the
 * database cannot be reached while building, it falls back to data/outlets.ts so the site still builds and shows
 * outlets.
 */
export async function getPublicOutlets(): Promise<readonly Outlet[]> {
  if (!hasDatabase()) return fallbackOutlets;
  try {
    await connectDB();
    const docs = await OutletModel.find({ published: true }).sort({ order: 1, createdAt: 1 }).lean<OutletRecord[]>();
    return docs.map(toOutlet);
  } catch (error) {
    console.error("[outlets] Could not read outlets from MongoDB; showing data/outlets.ts instead.", error);
    return fallbackOutlets;
  }
}

/** Every outlet, published or hidden, for the admin list. */
export async function listAdminOutlets(): Promise<AdminOutlet[]> {
  await connectDB();
  const docs = await OutletModel.find().sort({ order: 1, createdAt: 1 }).lean<OutletRecord[]>();
  return docs.map((doc) => ({
    ...toOutlet(doc),
    id: String(doc._id),
    order: doc.order ?? 0,
    published: doc.published !== false,
    updatedAt: doc.updatedAt?.toISOString(),
  }));
}

export async function getAdminOutlet(id: string): Promise<AdminOutlet | null> {
  await connectDB();
  if (!/^[a-f0-9]{24}$/i.test(id)) return null;
  const doc = await OutletModel.findById(id).lean<OutletRecord>();
  return doc ? { ...toOutlet(doc), id: String(doc._id), order: doc.order ?? 0, published: doc.published !== false } : null;
}

/** The districts already in use, for the district suggestions in the form. */
export async function listDistricts(): Promise<string[]> {
  await connectDB();
  const docs = await OutletModel.find().sort({ order: 1 }).select("district").lean<{ district: string }[]>();
  return [...new Set(docs.map((doc) => doc.district))];
}

/** The order for a new outlet: after the last outlet of its district, or at the end for a new district. */
export async function nextOrderFor(district: string): Promise<number> {
  await connectDB();
  const lastInDistrict = await OutletModel.findOne({ district }).sort({ order: -1 }).select("order").lean<{ order?: number }>();
  if (lastInDistrict) return (lastInDistrict.order ?? 0) + 1;
  const last = await OutletModel.findOne().sort({ order: -1 }).select("order").lean<{ order?: number }>();
  return (last?.order ?? 0) + 10;
}