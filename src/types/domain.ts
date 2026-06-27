export type Ability = "Gs" | "Gsm" | "Gf" | "Gv" | "Glr" | "Gc";

export const ABILITY_LABEL: Record<Ability, string> = {
  Gs: "処理速度",
  Gsm: "作業記憶",
  Gf: "流動性推論",
  Gv: "視覚処理",
  Glr: "記憶",
  Gc: "結晶性知能",
};

/** 加齢で低下する流動系（脳年齢推定の主軸）。Gc は対照アンカーなので含めない。 */
export const FLUID_ABILITIES: Ability[] = ["Gs", "Gsm", "Gf", "Gv", "Glr"];

export type Sex = "male" | "female" | "other";

export const SEX_LABEL: Record<Sex, string> = {
  male: "男性",
  female: "女性",
  other: "その他",
};

/** 職業カテゴリ（計測前に取得）。 */
export const OCCUPATIONS = [
  "会社員",
  "公務員",
  "自営業・経営者",
  "専門職（医療・士業など）",
  "学生",
  "パート・アルバイト",
  "主婦・主夫",
  "無職",
  "その他",
] as const;

export type Occupation = (typeof OCCUPATIONS)[number];

/** 業種（計測前に取得）。 */
export const INDUSTRIES = [
  "IT・通信",
  "製造",
  "医療・福祉",
  "教育",
  "金融・保険",
  "建設・不動産",
  "流通・小売",
  "公務",
  "サービス",
  "その他",
] as const;

export type Industry = (typeof INDUSTRIES)[number];

/** 職種（計測前に取得）。 */
export const JOB_TYPES = [
  "営業",
  "企画・マーケティング",
  "事務・管理",
  "技術・研究",
  "専門職",
  "製造・現場",
  "販売・接客",
  "クリエイティブ",
  "その他",
] as const;

export type JobType = (typeof JOB_TYPES)[number];

export const AGE_BANDS = [
  "10-14", "15-19", "20-24", "25-29", "30-34", "35-39", "40-44",
  "45-49", "50-54", "55-59", "60-64", "65-69", "70-74", "75-79", "80+",
] as const;

export type AgeBand = (typeof AGE_BANDS)[number];

/** 年齢帯の代表年齢（脳年齢回帰・規準補間に使う中央値）。 */
export const AGE_BAND_MID: Record<AgeBand, number> = {
  "10-14": 12, "15-19": 17, "20-24": 22, "25-29": 27, "30-34": 32,
  "35-39": 37, "40-44": 42, "45-49": 47, "50-54": 52, "55-59": 57,
  "60-64": 62, "65-69": 67, "70-74": 72, "75-79": 77, "80+": 82,
};

export interface Profile {
  age_band: AgeBand;
  sex: Sex;
  occupation?: Occupation;
  industry?: Industry;
  job_type?: JobType;
  postal_code?: string;
}
