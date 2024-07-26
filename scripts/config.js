const PROJECT_ROOT_DIR = process.cwd();

const INPUT_FILES = [
  '052_1981-09-05-a2_sridharmj_predstaviteli_raznyh_ras_pochitajut_drug_druga.md',
  '063_1982-05-18-e3_sridharmj_dlja_otnoshenij_s_vysshim_nachalom_neobhodimo_projavit_sebja_v_aspekte_shakti_a_ne_purushi.md'
];

const DIRS = {
  INPUT: PROJECT_ROOT_DIR + '/input/article/ru/05-rasa-tattva-vkusy-otnosheniy-s-gospodom',
  OUTPUT: PROJECT_ROOT_DIR + '/output',
  STYLES: PROJECT_ROOT_DIR + '/styles'
};

/**/
module.exports = {
  DIRS, INPUT_FILES
}
