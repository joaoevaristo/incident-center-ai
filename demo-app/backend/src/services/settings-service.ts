import prisma from '../utils/db';

export async function getAllSettings() {
  const settings = await prisma.setting.findMany();
  const result: Record<string, any> = {};
  for (const s of settings) {
    try {
      result[s.key] = JSON.parse(JSON.stringify(s.value));
    } catch {
      result[s.key] = s.value;
    }
  }
  return result;
}

export async function updateSetting(key: string, value: any) {
  const setting = await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
  return setting;
}

export async function getSetting(key: string) {
  const setting = await prisma.setting.findUnique({ where: { key } });
  if (!setting) return null;
  try {
    return { key, value: JSON.parse(JSON.stringify(setting.value)) };
  } catch {
    return { key, value: setting.value };
  }
}
