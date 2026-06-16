export type Procedure = {
  id: string; name: string; fullName: string; rule: string;
  sigtap: string[]; cbo: string[]; grupo: string | null; subgrupo: string | null;
  formaOrg: string | null; ptDescontado: number[]; tipo: ("PS-AMB"|"REGSMS")[];
  metaTotal: number; metaRegulacao: number; metaHospital: number;
};

export const PROCEDURES: Procedure[] = [
  {
    "id": "1.1",
    "name": "Coleta para exame laboratorial (PS-AMB)",
    "fullName": "1.1 Coleta para exame laboratorial (PS-AMB)",
    "rule": "(SIA) procedimento 0201020041 'coleta de material p/ exame laboratorial'",
    "sigtap": [
      "0201020041"
    ],
    "cbo": [],
    "grupo": null,
    "subgrupo": null,
    "formaOrg": null,
    "ptDescontado": [],
    "tipo": [
      "PS-AMB"
    ],
    "metaTotal": 510.0,
    "metaRegulacao": 0.0,
    "metaHospital": 510.0
  },
  {
    "id": "1.2",
    "name": "Biópsia percutânea orientada por TC, US ou RM (REGSMS - 20 / PS - 12)",
    "fullName": "1.2. Biópsia percutânea orientada por TC, US ou RM (REGSMS - 20 / PS - 12)",
    "rule": "(SIA) procedimento 0201010542 'biópsia percutânea orientada por TC, US ou RM'",
    "sigtap": [
      "0201010542"
    ],
    "cbo": [],
    "grupo": null,
    "subgrupo": null,
    "formaOrg": null,
    "ptDescontado": [],
    "tipo": [
      "REGSMS"
    ],
    "metaTotal": 32.0,
    "metaRegulacao": 20.0,
    "metaHospital": 12.0
  },
  {
    "id": "1.3",
    "name": "Diagnóstico em Laboratório Clínico (PS-AMB)",
    "fullName": "1.3. Diagnóstico em Laboratório Clínico (PS-AMB)",
    "rule": "DESCONTADO PT1 : grupo 02 ‘procedimentos com finalidade diagnostica’, subgrupo 02 ‘diagnostico em laboratório clinico’",
    "sigtap": [],
    "cbo": [],
    "grupo": "02",
    "subgrupo": "02",
    "formaOrg": null,
    "ptDescontado": [
      1
    ],
    "tipo": [
      "PS-AMB"
    ],
    "metaTotal": 6988.0,
    "metaRegulacao": 0.0,
    "metaHospital": 6988.0
  },
  {
    "id": "1.4",
    "name": "Diagnostico por radiologia - CONTRASTADO (PS-AMB)",
    "fullName": "1.4. Diagnostico por radiologia - CONTRASTADO (PS-AMB)",
    "rule": "(SIA) procedimentos 0204020018, 0204050073, 0204010012, 0204010195, 0204030013, 0204030021, 0204030080, 0204050014, 0204050022, 0204050030, 0204050049, 0204050057, 0204050065, 0204050081, 0204050090, 0204050154, 0204050162, 0204050170,0204050189 e 0204060010",
    "sigtap": [
      "0204010012",
      "0204010195",
      "0204020018",
      "0204030013",
      "0204030021",
      "0204030080",
      "0204050014",
      "0204050022",
      "0204050030",
      "0204050049",
      "0204050057",
      "0204050065",
      "0204050073",
      "0204050081",
      "0204050090",
      "0204050154",
      "0204050162",
      "0204050170",
      "0204050189",
      "0204060010"
    ],
    "cbo": [],
    "grupo": null,
    "subgrupo": null,
    "formaOrg": null,
    "ptDescontado": [],
    "tipo": [
      "PS-AMB"
    ],
    "metaTotal": 260.0,
    "metaRegulacao": 0.0,
    "metaHospital": 260.0
  },
  {
    "id": "1.5",
    "name": "Diagnostico por radiologia - SIMPLES (PS-5609/REGSMS-100)",
    "fullName": "1.5. Diagnostico por radiologia - SIMPLES (PS-5609/REGSMS-100)",
    "rule": "(SIA) grupo 02 'procedimentos com finalidade diagnostica’, subgrupo 04 'diagnostico por radiologia' EXCETO procedimento 0204030030 e citados como 'diagnostico por radiologia - CONTRASTADO'",
    "sigtap": [
      "0204030030"
    ],
    "cbo": [],
    "grupo": "02",
    "subgrupo": "04",
    "formaOrg": null,
    "ptDescontado": [],
    "tipo": [
      "REGSMS"
    ],
    "metaTotal": 5709.0,
    "metaRegulacao": 100.0,
    "metaHospital": 5609.0
  },
  {
    "id": "1.6",
    "name": "Ecocardiografia transtorácica (PS-20/REGSMS-62)",
    "fullName": "1.6. Ecocardiografia transtorácica (PS-20/REGSMS-62)",
    "rule": "(SIA) procedimento 0205010032 'ecocardiografia transtorácica'",
    "sigtap": [
      "0205010032"
    ],
    "cbo": [],
    "grupo": null,
    "subgrupo": null,
    "formaOrg": null,
    "ptDescontado": [],
    "tipo": [
      "REGSMS"
    ],
    "metaTotal": 82.0,
    "metaRegulacao": 62.0,
    "metaHospital": 20.0
  },
  {
    "id": "1.7",
    "name": "Diagnóstico por Ultrassonografia Geral (PS-100 e REGSMS-71)",
    "fullName": "1.7. Diagnóstico por Ultrassonografia Geral (PS-100 e REGSMS-71)",
    "rule": "DESCONTADO PT1 : grupo 02 ‘procedimentos com finalidade diagnostica’, subgrupo 05 ‘diagnostico por ultra-sonografia’, forma de organização 02 ‘ultra-sonografias dos demais sistemas’ EXCETO (SIA) procedimentos 0205020011, 0205020151",
    "sigtap": [
      "0205020011",
      "0205020151"
    ],
    "cbo": [],
    "grupo": "02",
    "subgrupo": "05",
    "formaOrg": "02",
    "ptDescontado": [
      1
    ],
    "tipo": [
      "REGSMS"
    ],
    "metaTotal": 171.0,
    "metaRegulacao": 71.0,
    "metaHospital": 100.0
  },
  {
    "id": "1.8",
    "name": "Diagnóstico por USG dopler colorido de vasos (REGSMS - 28)",
    "fullName": "1.8.Diagnóstico por USG dopler colorido de vasos (REGSMS - 28)",
    "rule": "DESCONTADO PT 2, 3, 4: (SIA) procedimento 0205010040 (para qualquer região anatômica - pernas, braços, pescoço, abdômen)",
    "sigtap": [
      "0205010040"
    ],
    "cbo": [],
    "grupo": null,
    "subgrupo": null,
    "formaOrg": null,
    "ptDescontado": [
      2
    ],
    "tipo": [
      "REGSMS"
    ],
    "metaTotal": 28.0,
    "metaRegulacao": 28.0,
    "metaHospital": 0.0
  },
  {
    "id": "1.9",
    "name": "Tomografia Computadorizada (PS-150)",
    "fullName": "1.9. Tomografia Computadorizada (PS-150)",
    "rule": "DESCONTADO PT1, 2, 3 e 4: (SIA) grupo 02 ‘procedimentos com finalidade diagnostica’, subgrupo 06 ‘diagnostico por tomografia’",
    "sigtap": [],
    "cbo": [],
    "grupo": "02",
    "subgrupo": "06",
    "formaOrg": null,
    "ptDescontado": [
      1
    ],
    "tipo": [
      "PS-AMB"
    ],
    "metaTotal": 150.0,
    "metaRegulacao": 0.0,
    "metaHospital": 150.0
  },
  {
    "id": "1.10",
    "name": "Gastroduodenoscopia e esofagoscopia (REGSMS-10)",
    "fullName": "1.10. Gastroduodenoscopia e esofagoscopia (REGSMS-10)",
    "rule": "DESCONTADO PT1: (SIA) procedimento 0209010037",
    "sigtap": [
      "0209010037"
    ],
    "cbo": [],
    "grupo": null,
    "subgrupo": null,
    "formaOrg": null,
    "ptDescontado": [
      1
    ],
    "tipo": [
      "REGSMS"
    ],
    "metaTotal": 10.0,
    "metaRegulacao": 10.0,
    "metaHospital": 0.0
  },
  {
    "id": "1.11",
    "name": "Laringoscopia (REGSMS-2) e Videolaringoscopia (REGSMS-1)",
    "fullName": "1.11. Laringoscopia (REGSMS-2) e Videolaringoscopia (REGSMS-1)",
    "rule": "(SIA) procedimento 0209040025 e 0209040041",
    "sigtap": [
      "0209040025",
      "0209040041"
    ],
    "cbo": [],
    "grupo": null,
    "subgrupo": null,
    "formaOrg": null,
    "ptDescontado": [],
    "tipo": [
      "REGSMS"
    ],
    "metaTotal": 13.0,
    "metaRegulacao": 3.0,
    "metaHospital": 10.0
  },
  {
    "id": "1.12",
    "name": "Colonoscopia (REGSMS-20) e retosigmoidoscopia (REGSMS-20)",
    "fullName": "1.12 Colonoscopia (REGSMS-20) e retosigmoidoscopia (REGSMS-20)",
    "rule": "DESCONTADO PT1: (SIA) procedimentos 0209010029 e 0209010053",
    "sigtap": [
      "0209010029",
      "0209010053"
    ],
    "cbo": [],
    "grupo": null,
    "subgrupo": null,
    "formaOrg": null,
    "ptDescontado": [
      1
    ],
    "tipo": [
      "REGSMS"
    ],
    "metaTotal": 40.0,
    "metaRegulacao": 40.0,
    "metaHospital": 0.0
  },
  {
    "id": "1.13",
    "name": "Colangiopancreatografia retrograda (PS/AMB/REGSMS-1)",
    "fullName": "1.13. Colangiopancreatografia retrograda (PS/AMB/REGSMS-1)",
    "rule": "(SIA) procedimento 0209010010",
    "sigtap": [
      "0209010010"
    ],
    "cbo": [],
    "grupo": null,
    "subgrupo": null,
    "formaOrg": null,
    "ptDescontado": [],
    "tipo": [
      "PS-AMB",
      "REGSMS"
    ],
    "metaTotal": 1.0,
    "metaRegulacao": 1.0,
    "metaHospital": 0.0
  },
  {
    "id": "1.14",
    "name": "Arteriografia (PS-2/REGSMS-3)",
    "fullName": "1.14. Arteriografia (PS-2/REGSMS-3)",
    "rule": "DESCONTADO PT 4: (SIA) procedimentos 0210010061, 0210010070, 0210010088, 0210010096, 0210010100, 0210010118, 0210010126, 0210010134, 0210010142 e 0210010150",
    "sigtap": [
      "0210010061",
      "0210010070",
      "0210010088",
      "0210010096",
      "0210010100",
      "0210010118",
      "0210010126",
      "0210010134",
      "0210010142",
      "0210010150"
    ],
    "cbo": [],
    "grupo": null,
    "subgrupo": null,
    "formaOrg": null,
    "ptDescontado": [
      4
    ],
    "tipo": [
      "REGSMS"
    ],
    "metaTotal": 5.0,
    "metaRegulacao": 3.0,
    "metaHospital": 2.0
  },
  {
    "id": "1.15",
    "name": "Eletrocardiograma (PS-AMB)",
    "fullName": "1.15. Eletrocardiograma (PS-AMB)",
    "rule": "(SIA) procedimento 0211020036",
    "sigtap": [
      "0211020036"
    ],
    "cbo": [],
    "grupo": null,
    "subgrupo": null,
    "formaOrg": null,
    "ptDescontado": [],
    "tipo": [
      "PS-AMB"
    ],
    "metaTotal": 459.0,
    "metaRegulacao": 0.0,
    "metaHospital": 459.0
  },
  {
    "id": "1.16",
    "name": "Diagnóstico em hemoterapia (proced. destinados a aplicação, qualific. sangue p/ fins de assist. hemot.) (PS-AMB)",
    "fullName": "1.16. Diagnóstico em hemoterapia (proced. destinados a aplicação, qualific. sangue p/ fins de assist. hemot.) (PS-AMB)",
    "rule": "(SIA) grupo 02 'procedimentos com finalidade diagnostica, subgrupo 12 'diagnostico em hemoterapia (proced. destinados à aplicação, qualific. sangue p/ fins deassist. hemoterápica)'",
    "sigtap": [],
    "cbo": [],
    "grupo": "02",
    "subgrupo": "12",
    "formaOrg": null,
    "ptDescontado": [],
    "tipo": [
      "PS-AMB"
    ],
    "metaTotal": 70.0,
    "metaRegulacao": 0.0,
    "metaHospital": 70.0
  },
  {
    "id": "1.17",
    "name": "Consulta com odontólogo bucomaxilofacial (REGSMS)",
    "fullName": "1.17. Consulta com odontólogo bucomaxilofacial (REGSMS)",
    "rule": "(SIA) procedimento 0301010048, CBO 223268",
    "sigtap": [
      "0301010048"
    ],
    "cbo": [
      "223268"
    ],
    "grupo": null,
    "subgrupo": null,
    "formaOrg": null,
    "ptDescontado": [],
    "tipo": [
      "REGSMS"
    ],
    "metaTotal": 144.0,
    "metaRegulacao": 144.0,
    "metaHospital": 0.0
  },
  {
    "id": "1.18",
    "name": "Consulta com psicólogo, nutricionista, assistente social, fonoaudiólogo, terapeuta ocupacional e cirurgião dentista clin",
    "fullName": "1.18. Consulta com psicólogo, nutricionista, assistente social, fonoaudiólogo, terapeuta ocupacional e cirurgião dentista clinico geral e enfermeiro (PS-AMB)",
    "rule": "(SIA) procedimento 0301010048, CBO 223710, 223905, 251510, 251520, 251540, 223810, 251605, 223208 e 223505.",
    "sigtap": [
      "0301010048"
    ],
    "cbo": [
      "223208",
      "223505",
      "223710",
      "223810",
      "223905",
      "251510",
      "251520",
      "251540",
      "251605"
    ],
    "grupo": null,
    "subgrupo": null,
    "formaOrg": null,
    "ptDescontado": [],
    "tipo": [
      "PS-AMB"
    ],
    "metaTotal": 5084.0,
    "metaRegulacao": 0.0,
    "metaHospital": 5084.0
  },
  {
    "id": "1.19",
    "name": "Atendimento de urgência c/ observação ate 24 horas em atenção especializada (PS-AMB)",
    "fullName": "1.19. Atendimento de urgência c/ observação ate 24 horas em atenção especializada (PS-AMB)",
    "rule": "(SIA) procedimento 0301060029",
    "sigtap": [
      "0301060029"
    ],
    "cbo": [],
    "grupo": null,
    "subgrupo": null,
    "formaOrg": null,
    "ptDescontado": [],
    "tipo": [
      "PS-AMB"
    ],
    "metaTotal": 3220.0,
    "metaRegulacao": 0.0,
    "metaHospital": 3220.0
  },
  {
    "id": "1.20",
    "name": "Atendimento de urgência em atenção especializada (PS-AMB)",
    "fullName": "1.20. Atendimento de urgência em atenção especializada (PS-AMB)",
    "rule": "(SIA) procedimento 0301060061",
    "sigtap": [
      "0301060061"
    ],
    "cbo": [],
    "grupo": null,
    "subgrupo": null,
    "formaOrg": null,
    "ptDescontado": [],
    "tipo": [
      "PS-AMB"
    ],
    "metaTotal": 1273.0,
    "metaRegulacao": 0.0,
    "metaHospital": 1273.0
  },
  {
    "id": "1.21",
    "name": "Atendimento ortopédico com imobilização provisória (PS-AMB)",
    "fullName": "1.21. Atendimento ortopédico com imobilização provisória (PS-AMB)",
    "rule": "(SIA) procedimento 0301060100, CBO somente médico",
    "sigtap": [
      "0301060100"
    ],
    "cbo": [],
    "grupo": null,
    "subgrupo": null,
    "formaOrg": null,
    "ptDescontado": [],
    "tipo": [
      "PS-AMB"
    ],
    "metaTotal": 2100.0,
    "metaRegulacao": 0.0,
    "metaHospital": 2100.0
  },
  {
    "id": "1.22",
    "name": "Administração de medicamento na atenção especializada (PS-AMB)",
    "fullName": "1.22. Administração de medicamento na atenção especializada (PS-AMB)",
    "rule": "(SIA) procedimento 0301100012, CBO de enfermeiro, técnico e auxiliar",
    "sigtap": [
      "0301100012"
    ],
    "cbo": [],
    "grupo": null,
    "subgrupo": null,
    "formaOrg": null,
    "ptDescontado": [],
    "tipo": [
      "PS-AMB"
    ],
    "metaTotal": 1998.0,
    "metaRegulacao": 0.0,
    "metaHospital": 1998.0
  },
  {
    "id": "1.23",
    "name": "Cons.Méd.Esp. Anestesiologista (PS-AMB)",
    "fullName": "1.23. Cons.Méd.Esp. Anestesiologista (PS-AMB)",
    "rule": "DESCONTADO PT1 e 3 (SIA) procedimento 0301010072, CBO 225151",
    "sigtap": [
      "0301010072"
    ],
    "cbo": [
      "225151"
    ],
    "grupo": null,
    "subgrupo": null,
    "formaOrg": null,
    "ptDescontado": [
      1
    ],
    "tipo": [
      "PS-AMB"
    ],
    "metaTotal": 313.0,
    "metaRegulacao": 0.0,
    "metaHospital": 313.0
  },
  {
    "id": "1.24",
    "name": "Cons.Méd.Esp. Cardiologista (REGSMS)",
    "fullName": "1.24. Cons.Méd.Esp. Cardiologista (REGSMS)",
    "rule": "(SIA) procedimento 0301010072, CBO 225120",
    "sigtap": [
      "0301010072"
    ],
    "cbo": [
      "225120"
    ],
    "grupo": null,
    "subgrupo": null,
    "formaOrg": null,
    "ptDescontado": [],
    "tipo": [
      "REGSMS"
    ],
    "metaTotal": 68.0,
    "metaRegulacao": 68.0,
    "metaHospital": 0.0
  },
  {
    "id": "1.25",
    "name": "Cons.Méd.Esp. cirurgião de cabeça e pescoço (REGSMS)",
    "fullName": "1.25. Cons.Méd.Esp. cirurgião de cabeça e pescoço (REGSMS)",
    "rule": "DESCONTADO PT1: (SIA) procedimento 0301010072, CBO 225215",
    "sigtap": [
      "0301010072"
    ],
    "cbo": [
      "225215"
    ],
    "grupo": null,
    "subgrupo": null,
    "formaOrg": null,
    "ptDescontado": [
      1
    ],
    "tipo": [
      "REGSMS"
    ],
    "metaTotal": 181.0,
    "metaRegulacao": 181.0,
    "metaHospital": 0.0
  },
  {
    "id": "1.26",
    "name": "Cons.Méd.Esp. cirurgião vascular (REGSMS)",
    "fullName": "1.26. Cons.Méd.Esp. cirurgião vascular (REGSMS)",
    "rule": "(SIA) procedimento 0301010072, CBO 225203",
    "sigtap": [
      "0301010072"
    ],
    "cbo": [
      "225203"
    ],
    "grupo": null,
    "subgrupo": null,
    "formaOrg": null,
    "ptDescontado": [],
    "tipo": [
      "REGSMS"
    ],
    "metaTotal": 99.0,
    "metaRegulacao": 99.0,
    "metaHospital": 0.0
  },
  {
    "id": "1.27",
    "name": "Cons.Méd.Esp. cirurgião geral, Fígado,Pâncreas e Vias Biliares (REGSMS)",
    "fullName": "1.27. Cons.Méd.Esp. cirurgião geral, Fígado,Pâncreas e Vias Biliares (REGSMS)",
    "rule": "(SIA) procedimento 0301010072, CBO 225225",
    "sigtap": [
      "0301010072"
    ],
    "cbo": [
      "225225"
    ],
    "grupo": null,
    "subgrupo": null,
    "formaOrg": null,
    "ptDescontado": [],
    "tipo": [
      "REGSMS"
    ],
    "metaTotal": 369.0,
    "metaRegulacao": 369.0,
    "metaHospital": 0.0
  },
  {
    "id": "1.28",
    "name": "Cons.Méd.Esp. cirurgião plástico (REGSMS)",
    "fullName": "1.28. Cons.Méd.Esp. cirurgião plástico (REGSMS)",
    "rule": "(SIA) procedimento 0301010072, CBO 225235",
    "sigtap": [
      "0301010072"
    ],
    "cbo": [
      "225235"
    ],
    "grupo": null,
    "subgrupo": null,
    "formaOrg": null,
    "ptDescontado": [],
    "tipo": [
      "REGSMS"
    ],
    "metaTotal": 173.0,
    "metaRegulacao": 173.0,
    "metaHospital": 0.0
  },
  {
    "id": "1.29",
    "name": "Cons.Méd.Esp. cirurgião torácico (REGSMS)",
    "fullName": "1.29. Cons.Méd.Esp. cirurgião torácico (REGSMS)",
    "rule": "DESCONTADO PT1: (SIA) procedimento 0301010072, CBO 225240",
    "sigtap": [
      "0301010072"
    ],
    "cbo": [
      "225240"
    ],
    "grupo": null,
    "subgrupo": null,
    "formaOrg": null,
    "ptDescontado": [
      1
    ],
    "tipo": [
      "REGSMS"
    ],
    "metaTotal": 54.0,
    "metaRegulacao": 54.0,
    "metaHospital": 0.0
  },
  {
    "id": "1.30",
    "name": "Cons.Méd.Esp. Gastroenterologista (REGSMS-70) e Hepatologista (REGSMS-53)",
    "fullName": "1.30. Cons.Méd.Esp. Gastroenterologista (REGSMS-70) e Hepatologista (REGSMS-53)",
    "rule": "DESCONTADO PT1: (SIA) procedimento 0301010072, CBO 225165",
    "sigtap": [
      "0301010072"
    ],
    "cbo": [
      "225165"
    ],
    "grupo": null,
    "subgrupo": null,
    "formaOrg": null,
    "ptDescontado": [
      1
    ],
    "tipo": [
      "REGSMS"
    ],
    "metaTotal": 123.0,
    "metaRegulacao": 123.0,
    "metaHospital": 0.0
  },
  {
    "id": "1.31",
    "name": "Cons.Méd.Esp. Infectologista (REGSMS)",
    "fullName": "1.31.Cons.Méd.Esp. Infectologista (REGSMS)",
    "rule": "(SIA) procedimento 0301010072, CBO 225103",
    "sigtap": [
      "0301010072"
    ],
    "cbo": [
      "225103"
    ],
    "grupo": null,
    "subgrupo": null,
    "formaOrg": null,
    "ptDescontado": [],
    "tipo": [
      "REGSMS"
    ],
    "metaTotal": 33.0,
    "metaRegulacao": 33.0,
    "metaHospital": 0.0
  },
  {
    "id": "1.32",
    "name": "Cons.Méd.Esp. Geriatra (REGSMS)",
    "fullName": "1.32.Cons.Méd.Esp. Geriatra (REGSMS)",
    "rule": "(SIA) procedimento 0301010072, CBO 225180",
    "sigtap": [
      "0301010072"
    ],
    "cbo": [
      "225180"
    ],
    "grupo": null,
    "subgrupo": null,
    "formaOrg": null,
    "ptDescontado": [],
    "tipo": [
      "REGSMS"
    ],
    "metaTotal": 8.0,
    "metaRegulacao": 8.0,
    "metaHospital": 0.0
  },
  {
    "id": "1.33",
    "name": "Cons.Méd.Esp. Hematologista e Hemoterapeuta (REGSMS)",
    "fullName": "1.33.Cons.Méd.Esp. Hematologista e Hemoterapeuta (REGSMS)",
    "rule": "DESCONTADO PT1: (SIA) procedimento 0301010072, CBO 225185 e 225340",
    "sigtap": [
      "0301010072"
    ],
    "cbo": [
      "225185",
      "225340"
    ],
    "grupo": null,
    "subgrupo": null,
    "formaOrg": null,
    "ptDescontado": [
      1
    ],
    "tipo": [
      "REGSMS"
    ],
    "metaTotal": 476.0,
    "metaRegulacao": 476.0,
    "metaHospital": 0.0
  },
  {
    "id": "1.34",
    "name": "Cons.Méd.Esp. Nefrologista (REGSMS-59) Hipertensão Arterial Refratária (REGSMS-50)",
    "fullName": "1.34.Cons.Méd.Esp. Nefrologista (REGSMS-59) Hipertensão Arterial Refratária (REGSMS-50)",
    "rule": "(SIA) procedimento 0301010072, CBO 225109",
    "sigtap": [
      "0301010072"
    ],
    "cbo": [
      "225109"
    ],
    "grupo": null,
    "subgrupo": null,
    "formaOrg": null,
    "ptDescontado": [],
    "tipo": [
      "REGSMS"
    ],
    "metaTotal": 109.0,
    "metaRegulacao": 109.0,
    "metaHospital": 0.0
  },
  {
    "id": "1.35",
    "name": "Cons.Méd.Esp. Neurocirurgião (REGSMS)",
    "fullName": "1.35.Cons.Méd.Esp. Neurocirurgião (REGSMS)",
    "rule": "DESCONTADO PT3 e 4: (SIA) procedimento 0301010072, CBO 225260",
    "sigtap": [
      "0301010072"
    ],
    "cbo": [
      "225260"
    ],
    "grupo": null,
    "subgrupo": null,
    "formaOrg": null,
    "ptDescontado": [
      3
    ],
    "tipo": [
      "REGSMS"
    ],
    "metaTotal": 50.0,
    "metaRegulacao": 50.0,
    "metaHospital": 0.0
  },
  {
    "id": "1.36",
    "name": "Cons.Méd.Esp. Neurologia",
    "fullName": "1.36.Cons.Méd.Esp. Neurologia",
    "rule": "DESCONTADO PT3: (SIA) procedimento 0301010072, CBO 225112",
    "sigtap": [
      "0301010072"
    ],
    "cbo": [
      "225112"
    ],
    "grupo": null,
    "subgrupo": null,
    "formaOrg": null,
    "ptDescontado": [
      3
    ],
    "tipo": [
      "PS-AMB"
    ],
    "metaTotal": 560.0,
    "metaRegulacao": 0.0,
    "metaHospital": 560.0
  },
  {
    "id": "1.37",
    "name": "Cons.Méd.Esp. ortopedista e traumatologista (REGSMS)",
    "fullName": "1.37.Cons.Méd.Esp. ortopedista e traumatologista (REGSMS)",
    "rule": "DESCONTADO PT2: (SIA) procedimento 0301010072, CBO 225270",
    "sigtap": [
      "0301010072"
    ],
    "cbo": [
      "225270"
    ],
    "grupo": null,
    "subgrupo": null,
    "formaOrg": null,
    "ptDescontado": [
      2
    ],
    "tipo": [
      "REGSMS"
    ],
    "metaTotal": 3248.0,
    "metaRegulacao": 3248.0,
    "metaHospital": 0.0
  },
  {
    "id": "1.38",
    "name": "Cons.Méd.Esp. Otorrinolaringologista (REGSMS)",
    "fullName": "1.38.Cons.Méd.Esp. Otorrinolaringologista (REGSMS)",
    "rule": "(SIA) procedimento 0301010072, CBO 225275",
    "sigtap": [
      "0301010072"
    ],
    "cbo": [
      "225275"
    ],
    "grupo": null,
    "subgrupo": null,
    "formaOrg": null,
    "ptDescontado": [],
    "tipo": [
      "REGSMS"
    ],
    "metaTotal": 462.0,
    "metaRegulacao": 462.0,
    "metaHospital": 0.0
  },
  {
    "id": "1.39",
    "name": "Cons.Méd.Esp. ColoProctologista (REGSMS)",
    "fullName": "1.39.Cons.Méd.Esp. ColoProctologista (REGSMS)",
    "rule": "DESCONTADO PT1: (SIA) procedimento 0301010072, CBO 225280",
    "sigtap": [
      "0301010072"
    ],
    "cbo": [
      "225280"
    ],
    "grupo": null,
    "subgrupo": null,
    "formaOrg": null,
    "ptDescontado": [
      1
    ],
    "tipo": [
      "REGSMS"
    ],
    "metaTotal": 114.0,
    "metaRegulacao": 114.0,
    "metaHospital": 0.0
  },
  {
    "id": "1.40",
    "name": "Cons.Méd.Esp. Urologista (REGSMS)",
    "fullName": "1.40.Cons.Méd.Esp. Urologista (REGSMS)",
    "rule": "DESCONTADO PT1: (SIA) procedimento 0301010072, CBO 225285",
    "sigtap": [
      "0301010072"
    ],
    "cbo": [
      "225285"
    ],
    "grupo": null,
    "subgrupo": null,
    "formaOrg": null,
    "ptDescontado": [
      1
    ],
    "tipo": [
      "REGSMS"
    ],
    "metaTotal": 210.0,
    "metaRegulacao": 210.0,
    "metaHospital": 0.0
  },
  {
    "id": "1.41",
    "name": "Cons. Méd. Esp. Clinico Geral, Generalista (PS/AMB)",
    "fullName": "1.41. Cons. Méd. Esp. Clinico Geral, Generalista (PS/AMB)",
    "rule": "(SIA) procedimento 0301010072, CBO 225125, 225170",
    "sigtap": [
      "0301010072"
    ],
    "cbo": [
      "225125",
      "225170"
    ],
    "grupo": null,
    "subgrupo": null,
    "formaOrg": null,
    "ptDescontado": [],
    "tipo": [
      "PS-AMB"
    ],
    "metaTotal": 97.0,
    "metaRegulacao": 0.0,
    "metaHospital": 97.0
  },
  {
    "id": "1.42",
    "name": "Cons. Méd. Esp. Cirurgião Cardiovascular (PS/AMB)",
    "fullName": "1.42. Cons. Méd. Esp. Cirurgião Cardiovascular (PS/AMB)",
    "rule": "SIA) procedimento 0301010072, CBO 225210",
    "sigtap": [
      "0301010072"
    ],
    "cbo": [
      "225210"
    ],
    "grupo": null,
    "subgrupo": null,
    "formaOrg": null,
    "ptDescontado": [],
    "tipo": [
      "PS-AMB"
    ],
    "metaTotal": 50.0,
    "metaRegulacao": 0.0,
    "metaHospital": 50.0
  },
  {
    "id": "1.43",
    "name": "Cons. Méd. Esp. Radioterapeuta (PS/AMB)",
    "fullName": "1.43. Cons. Méd. Esp. Radioterapeuta (PS/AMB)",
    "rule": "SIA) procedimento 0301010072, CBO 225330",
    "sigtap": [
      "0301010072"
    ],
    "cbo": [
      "225330"
    ],
    "grupo": null,
    "subgrupo": null,
    "formaOrg": null,
    "ptDescontado": [],
    "tipo": [
      "PS-AMB"
    ],
    "metaTotal": 460.0,
    "metaRegulacao": 0.0,
    "metaHospital": 460.0
  },
  {
    "id": "1.44",
    "name": "Cons. Méd. Esp. Oftalmologista (PS/AMB)",
    "fullName": "1.44. Cons. Méd. Esp. Oftalmologista (PS/AMB)",
    "rule": "SIA) procedimento 0301010072, CBO 225265",
    "sigtap": [
      "0301010072"
    ],
    "cbo": [
      "225265"
    ],
    "grupo": null,
    "subgrupo": null,
    "formaOrg": null,
    "ptDescontado": [],
    "tipo": [
      "PS-AMB"
    ],
    "metaTotal": 50.0,
    "metaRegulacao": 0.0,
    "metaHospital": 50.0
  },
  {
    "id": "1.45",
    "name": "Acompanhamento de pequeno queimado Médio e grande queimado (PS/AMB)",
    "fullName": "1.45. Acompanhamento de pequeno queimado Médio e grande queimado (PS/AMB)",
    "rule": "(SIA) procedimentos 0301110026 e 0301110018",
    "sigtap": [
      "0301110018",
      "0301110026"
    ],
    "cbo": [],
    "grupo": null,
    "subgrupo": null,
    "formaOrg": null,
    "ptDescontado": [],
    "tipo": [
      "PS-AMB"
    ],
    "metaTotal": 2.0,
    "metaRegulacao": 0.0,
    "metaHospital": 2.0
  },
  {
    "id": "1.46",
    "name": "Tratamentos clínicos ortopedia (PS/AMB)",
    "fullName": "1.46. Tratamentos clínicos ortopedia (PS/AMB)",
    "rule": "(SIA) grupo 03 'procedimentos clínicos, subgrupo 03 'tratamentos clínicos (outras especialidades)'; forma de organização 09 'tratamento de doenças do sistema osteomuscular e do tecido conjuntivo'",
    "sigtap": [],
    "cbo": [],
    "grupo": "03",
    "subgrupo": "03",
    "formaOrg": "09",
    "ptDescontado": [],
    "tipo": [
      "PS-AMB"
    ],
    "metaTotal": 77.0,
    "metaRegulacao": 0.0,
    "metaHospital": 77.0
  },
  {
    "id": "1.47",
    "name": "Tratamentos clínicos (outras especialidades) (PS/AMB)",
    "fullName": "1.47. Tratamentos clínicos (outras especialidades) (PS/AMB)",
    "rule": "(SIA) grupo 03 'procedimentos clínicos, subgrupo 03 'tratamentos clínicos (outras especialidades)' EXCETO grupo 03 'procedimentos clínicos, subgrupo 03 'tratamentos clínicos (outras especialidades)'; forma de organização 09 'tratamento de doenças do sistema osteomuscular e do tecido conjuntivo'",
    "sigtap": [],
    "cbo": [],
    "grupo": "03",
    "subgrupo": "03",
    "formaOrg": "09",
    "ptDescontado": [],
    "tipo": [
      "PS-AMB"
    ],
    "metaTotal": 8.0,
    "metaRegulacao": 0.0,
    "metaHospital": 8.0
  },
  {
    "id": "1.48",
    "name": "Hemoterapia (PS/AMB)",
    "fullName": "1.48.Hemoterapia (PS/AMB)",
    "rule": "(SIA) grupo 03 'procedimentos clínicos, subgrupo 06 'hemoterapia'",
    "sigtap": [],
    "cbo": [],
    "grupo": "03",
    "subgrupo": "06",
    "formaOrg": null,
    "ptDescontado": [],
    "tipo": [
      "PS-AMB"
    ],
    "metaTotal": 34.0,
    "metaRegulacao": 0.0,
    "metaHospital": 34.0
  },
  {
    "id": "1.49",
    "name": "Pequena cirurgia e cirurgia de pele, tecido subcutâneo e mucosa (PS/AMB)",
    "fullName": "1.49. Pequena cirurgia e cirurgia de pele, tecido subcutâneo e mucosa (PS/AMB)",
    "rule": "(SIA) grupo 04 'procedimentos cirúrgicos, subgrupo 01 'pequena cirurgia e cirurgia de pele, tecido subcutâneo e mucosa'.",
    "sigtap": [],
    "cbo": [],
    "grupo": "04",
    "subgrupo": "01",
    "formaOrg": null,
    "ptDescontado": [],
    "tipo": [
      "PS-AMB"
    ],
    "metaTotal": 537.0,
    "metaRegulacao": 0.0,
    "metaHospital": 537.0
  },
  {
    "id": "1.50",
    "name": "Cirurgia das vias aéreas superiores, da face e do pescoço (PS/AMB)",
    "fullName": "1.50. Cirurgia das vias aéreas superiores, da face e do pescoço (PS/AMB)",
    "rule": "(SIA) grupo 04 'procedimentos cirúrgicos, subgrupo 04 'cirurgia das vias aéreas superiores, da face e do pescoço'.",
    "sigtap": [],
    "cbo": [],
    "grupo": "04",
    "subgrupo": "04",
    "formaOrg": null,
    "ptDescontado": [],
    "tipo": [
      "PS-AMB"
    ],
    "metaTotal": 4.0,
    "metaRegulacao": 0.0,
    "metaHospital": 4.0
  },
  {
    "id": "1.51",
    "name": "Cirurgia do aparelho da visão (AMB/REGSMS-57)",
    "fullName": "1.51. Cirurgia do aparelho da visão (AMB/REGSMS-57)",
    "rule": "(SIA) grupo 04 'procedimentos cirúrgicos, subgrupo 05 'cirurgia do aparelho da visão' EXCETO (SIA) procedimentos 0405050097 e 0405050100 mais (SIA) procedimento 0405050119 (atendimento da fila de espera de cirurgia eletiva)",
    "sigtap": [
      "0405050097",
      "0405050100",
      "0405050119"
    ],
    "cbo": [],
    "grupo": "04",
    "subgrupo": "05",
    "formaOrg": null,
    "ptDescontado": [],
    "tipo": [
      "REGSMS"
    ],
    "metaTotal": 57.0,
    "metaRegulacao": 57.0,
    "metaHospital": 0.0
  },
  {
    "id": "1.52",
    "name": "Cirurgia do aparelho circulatório; cirurgia do aparelho digestivo órgãos anexos e parede abdominal; cirurgia do aparelho",
    "fullName": "1.52. Cirurgia do aparelho circulatório; cirurgia do aparelho digestivo órgãos anexos e parede abdominal; cirurgia do aparelho geniturinário; cirurgia torácica; outras cirurgias (PS/AMB)",
    "rule": "(SIA) grupo 04 'procedimentos cirúrgicos, subgrupo 06 'cirurgia do aparelho circulatório'; subgrupo 07 'cirurgia do aparelho digestivo órgãos anexos e parede abdominal'; subgrupo 09 'cirurgia do aparelho geniturinário'; subgrupo 12 'cirurgia torácica'; subgrupo 15 'outras cirurgias'.",
    "sigtap": [],
    "cbo": [],
    "grupo": "04",
    "subgrupo": "06",
    "formaOrg": null,
    "ptDescontado": [],
    "tipo": [
      "PS-AMB"
    ],
    "metaTotal": 5.0,
    "metaRegulacao": 0.0,
    "metaHospital": 5.0
  },
  {
    "id": "1.53",
    "name": "Cirurgia osteomuscular (AMB/REGSMS)",
    "fullName": "1.53. Cirurgia osteomuscular (AMB/REGSMS)",
    "rule": "(SIA) grupo 04 'procedimentos cirúrgicos', subgrupo08 cirurgia osteomuscular' (atendimento da fila de espera de cirurgia eletiva)",
    "sigtap": [],
    "cbo": [],
    "grupo": "04",
    "subgrupo": null,
    "formaOrg": null,
    "ptDescontado": [],
    "tipo": [
      "REGSMS"
    ],
    "metaTotal": 55.0,
    "metaRegulacao": 55.0,
    "metaHospital": 0.0
  },
  {
    "id": "1.54",
    "name": "Cirurgia reparadora e curativo de grande queimado (PS/AMB)",
    "fullName": "1.54. Cirurgia reparadora e curativo de grande queimado (PS/AMB)",
    "rule": "(SIA) grupo 04 'procedimentos cirúrgicos', subgrupo13 'cirurgia reparadora'.",
    "sigtap": [],
    "cbo": [],
    "grupo": "04",
    "subgrupo": null,
    "formaOrg": null,
    "ptDescontado": [],
    "tipo": [
      "PS-AMB"
    ],
    "metaTotal": 1.0,
    "metaRegulacao": 0.0,
    "metaHospital": 1.0
  },
  {
    "id": "1.55",
    "name": "Anestesias (PS/AMB)",
    "fullName": "1.55. Anestesias (PS/AMB)",
    "rule": "(SIA) grupo 04 'procedimentos cirúrgicos, subgrupo 17 'anestesias'.",
    "sigtap": [],
    "cbo": [],
    "grupo": "04",
    "subgrupo": "17",
    "formaOrg": null,
    "ptDescontado": [],
    "tipo": [
      "PS-AMB"
    ],
    "metaTotal": 54.0,
    "metaRegulacao": 0.0,
    "metaHospital": 54.0
  }
] as Procedure[];
