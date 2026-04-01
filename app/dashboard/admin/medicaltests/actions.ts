"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface Category {
  id: string;
  name: string;
}

export interface UOM {
  id: string;
  name: string;
}

export interface MedicalTest {
  id: string;
  name: string;
  description: string | null;
  iduom: string;
  idcategory: string;
  normalmin: number | null;
  normalmax: number | null;
  category: string; // From JOIN
  unit: string;     // From JOIN
}

// Fetch all categories for the dropdown
export async function getCategories(): Promise<Category[]> {
  const { rows } = await query<Category>('SELECT id, name FROM public.testcategories ORDER BY name ASC');
  return rows;
}

// Fetch all UOMs for the dropdown
export async function getUOMs(): Promise<UOM[]> {
  const { rows } = await query<UOM>('SELECT id, name FROM public.uom ORDER BY name ASC');
  return rows;
}

// STEP C: Use SQL JOIN to show the UOM Name and Category Name
export async function getMedicalTests(): Promise<MedicalTest[]> {
  const { rows } = await query<MedicalTest>(`
    SELECT mt.id, mt.name, mt.description, mt.iduom, mt.idcategory, mt.normalmin, mt.normalmax, 
           tc.name AS category, u.name AS unit
    FROM public.medicaltests mt
    LEFT JOIN public.testcategories tc ON mt.idcategory = tc.id
    LEFT JOIN public.uom u ON mt.iduom = u.id
    ORDER BY mt.id ASC
  `);
  return rows;
}

export async function addMedicalTest(data: Omit<MedicalTest, "id" | "category" | "unit">): Promise<void> {
  await query(
    `INSERT INTO public.medicaltests (name, description, iduom, idcategory, normalmin, normalmax) 
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [data.name, data.description || null, data.iduom, data.idcategory, data.normalmin || null, data.normalmax || null]
  );
  revalidatePath("/dashboard/admin/medicaltests");
}

export async function updateMedicalTest(id: string, data: Omit<MedicalTest, "id" | "category" | "unit">): Promise<void> {
  await query(
    `UPDATE public.medicaltests 
     SET name = $2, description = $3, iduom = $4, idcategory = $5, normalmin = $6, normalmax = $7 
     WHERE id = $1`,
    [id, data.name, data.description || null, data.iduom, data.idcategory, data.normalmin || null, data.normalmax || null]
  );
  revalidatePath("/dashboard/admin/medicaltests");
}

export async function deleteMedicalTest(id: string): Promise<void> {
  await query('DELETE FROM public.medicaltests WHERE id = $1', [id]);
  revalidatePath("/dashboard/admin/medicaltests");
}