import { SustainabilityCriterionPresentable } from "@unece/cotton-fetch";
import Transformation from "../models/Transformation";
import CompanyInfo from "../models/CompanyInfo";
import Trade from "../models/Trade";
import Edge from "../models/Edge";
import Material from "../models/Material";
import Node from "../models/Node";
import SupplyChainInfo from "../models/SupplyChainInfo";

export const defaultNodeEdgeColor = "#7a7a7a";
export const validNodeEdgeColor = "#4edb34";
export const invalidNodeEdgeColor = "#e50000";
export const partialValidNodeEdgeColor = "#e5bf00";

export const getNodeColor = (
  sustainabilityCriterion: SustainabilityCriterionPresentable | null,
  transformation: Transformation | null,
  allTransformations: Transformation[],
) => {
  // console.log(transformation?.name, allTransformations
  //     .flatMap(t => t.certificates))

  const arr =
    transformation?.processing_standards
      ?.filter((p) =>
        (sustainabilityCriterion?.processingStandardNames || []).includes(p),
      )
      // ?.flatMap(p => transformation?.certificates?.filter(c => c?.processStandardName === p))
      // ?.map(certificate => {
      //     const nonValidMaterialCertificate = certificate?.subject === 'MATERIAL' &&
      //         allTransformations
      //             .filter(t => t.id !== transformation?.id)
      //             .flatMap(t => t.certificates)
      //             .filter(otherCert => otherCert.subject === 'SELF' && otherCert.status === 'ACCEPTED' && otherCert.id === certificate.id)
      //             .length === 0;
      //
      // return !(nonValidMaterialCertificate || certificate.status !== 'ACCEPTED')
      // })
      ?.flatMap((p, id) => {
        const certificates =
          transformation?.certificates?.filter(
            (c) =>
              c.processStandardName === p &&
              (c.processTypes && c.processTypes.length > 0
                ? c.processTypes.some(
                    (x) => transformation?.processesNames?.includes(x),
                  )
                : true),
          ) || [];
        const cert =
          certificates.map((certificate) => {
            const nonValidMaterialCertificate =
              certificate?.subject === "MATERIAL" &&
              allTransformations
                .filter((t) => t.id !== transformation?.id)
                .flatMap((t) => t.certificates)
                .filter(
                  (otherCert) =>
                    otherCert.subject === "SELF" &&
                    otherCert.status === "ACCEPTED" &&
                    otherCert.id === certificate.id,
                ).length === 0;
            return !(
              nonValidMaterialCertificate || certificate.status !== "ACCEPTED"
            );
          }) || [];
        return cert.length > 0 ? cert : [false];
      }) || [];
  if (arr.length === 0) return defaultNodeEdgeColor;
  if (arr.every((v) => v))
    //All true
    return validNodeEdgeColor;
  if (arr.every((v) => !v))
    //All false
    return invalidNodeEdgeColor;
  return partialValidNodeEdgeColor; //Some true and some false
};

export const getEdgeColor = (
  sustainabilityCriterion: SustainabilityCriterionPresentable | null,
  trades: Trade[],
) => {
  const arr = trades.map((t) => {
    return (
      t?.processing_standards
        ?.filter((p) =>
          (sustainabilityCriterion?.processingStandardNames || []).includes(p),
        )
        ?.map(
          (p) =>
            !!t.certificates?.find(
              (c) => c.processStandardName === p && c.status === "ACCEPTED",
            ),
        ) || []
    );
  });
  if (arr.every((a) => a.length === 0)) return defaultNodeEdgeColor;
  if (arr.every((a) => a.every((v) => v)))
    //All true
    return validNodeEdgeColor;
  if (arr.every((a) => a.every((v) => !v)))
    //All false
    return invalidNodeEdgeColor;
  return partialValidNodeEdgeColor; //Some true and some false
};

export const getSustainabilityCriteriaCondition = (
  sc: SustainabilityCriterionPresentable | null,
) => {
  switch (sc?.name) {
    case "Organic":
      return (x: number) => x % 2 === 0;
    case "Chemical":
      return (x: number) => x % 3 === 0;
    case "Recycled":
      return (x: number) => x < 4;
    case "Quality":
      return (x: number) => x;
    case "Social":
      return (x: number) => x === 5;
    default:
      return () => false;
  }
};
export const getNodeLabel = (sc: SustainabilityCriterionPresentable | null) => {
  switch (sc?.name) {
    case "Origin":
      return (t: Transformation | null, f: CompanyInfo | null) =>
        (t?.processesNames || []).join(", ") +
        "\n" +
        [f?.visibleName, f?.region, f?.country]
          .filter((c) => c && c !== "")
          .join(", ");
    case "Organic":
      return (t: Transformation | null, f: CompanyInfo | null) =>
        (t?.processesNames || []).join(", ") +
        "\n" +
        [f?.visibleName, t?.name]
          .filter((info) => info && info !== "")
          .join(", ");
    case "Chemical":
      return (t: Transformation | null, f: CompanyInfo | null) =>
        (t?.processesNames || []).join(", ") +
        "\n" +
        [f?.visibleName, t?.name]
          .filter((info) => info && info !== "")
          .join(", ");
    case "Recycled":
      return (t: Transformation | null, f: CompanyInfo | null) =>
        (t?.processesNames || []).join(", ") +
        "\n" +
        [f?.visibleName, t?.name]
          .filter((info) => info && info !== "")
          .join(", ");
    case "Quality":
      return (t: Transformation | null, f: CompanyInfo | null) =>
        (t?.processesNames || []).join(", ") +
        "\n" +
        [f?.visibleName, t?.name]
          .filter((info) => info && info !== "")
          .join(", ");
    case "Social":
      return (t: Transformation | null, f: CompanyInfo | null) =>
        (t?.processesNames || []).join(", ") +
        "\n" +
        [f?.visibleName, t?.name]
          .filter((info) => info && info !== "")
          .join(", ");
    default:
      return (t: Transformation | null, f: CompanyInfo | null) =>
        (t?.processesNames || []).join(", ") +
        "\n" +
        [f?.visibleName, t?.name]
          .filter((info) => info && info !== "")
          .join(", ");
  }
};

export const getTradesFromEdge = (
  supplyChain: SupplyChainInfo | null,
  edge: Edge | null,
) => {
  if (!edge || !supplyChain) return [];
  const transformationFrom =
    supplyChain?.transformations?.find((t: any) => t.id === edge?.from) || null;
  const transformationTo =
    supplyChain?.transformations?.find((t: any) => t.id === edge?.to) || null;

  const outputMaterialFrom =
    supplyChain?.materials?.filter(
      (m: Material) => m?.id === transformationFrom?.output_material_ids[0],
    )?.[0] || null;
  const inputMaterialsTo =
    supplyChain?.materials?.filter(
      (m: Material) => transformationTo?.input_material_ids?.includes(m?.id),
    ) || null;

  return supplyChain?.trades?.filter(
    (t: Trade) =>
      Number([...t?.consignee_to_contractor_material_map?.values()][0]) ===
        outputMaterialFrom?.id &&
      inputMaterialsTo
        ?.map((m) => m.id)
        .includes(
          Number([...t?.consignee_to_contractor_material_map?.keys()][0]),
        ),
  );
};

const findSourceTrades = (
  materialsIds: number[],
  supplyChainInfo: SupplyChainInfo,
) => {
  const sourceTrades = new Map<number, Trade>();
  for (const tr of supplyChainInfo.trades) {
    for (const mId of materialsIds) {
      if (tr.consignee_to_contractor_material_map.has(mId)) {
        sourceTrades.set(mId, tr);
      }
    }
  }
  return sourceTrades;
};

const findCompany = (
  transformation: Transformation | undefined,
  supplyChainInfo: SupplyChainInfo,
) => {
  if (!transformation) return undefined;
  for (const c of supplyChainInfo.companiesInfo) {
    if (c.name === transformation.executor_company_id) return c;
  }
  return undefined;
};

export const findTransformation = (
  materialId: number | undefined,
  supplyChainInfo: SupplyChainInfo,
) => {
  if (!materialId) return undefined;
  for (const t of supplyChainInfo.transformations) {
    if (t.output_material_ids.includes(materialId)) return t;
  }
  return undefined;
};

export const expandTransformation = async (
  transformation: Transformation,
  to_node: Node,
  supplyChainInfo: SupplyChainInfo,
): Promise<{ nodes: Node[]; edges: Edge[] }> => {
  const sourceTrades = findSourceTrades(
    transformation.input_material_ids,
    supplyChainInfo,
  );
  let nodes: Node[] = [];
  let edges: Edge[] = [];
  for (const [mId, trade] of sourceTrades.entries()) {
    const sourceMaterialId =
      trade.consignee_to_contractor_material_map.get(mId);
    const sourceTransformation = findTransformation(
      sourceMaterialId,
      supplyChainInfo,
    );
    if (!sourceTransformation) {
      console.log(
        "We cannot determine the transformation that generated",
        sourceMaterialId,
      );
      continue;
    }
    const companyInfo = findCompany(sourceTransformation, supplyChainInfo);
    if (!companyInfo) {
      console.log(
        "We cannot determine the company that executed",
        sourceTransformation.name,
      );
      continue;
    }

    const sourceNode: Node = new Node(
      sourceTransformation?.id,
      (sourceTransformation.processesNames || []).join(", ") +
        "\n" +
        sourceTransformation?.name,
    );
    nodes.push(sourceNode);

    const material = supplyChainInfo.materials.find((m) => m.id === mId);
    const percentage = transformation.input_material_id_percentage_map.get(mId);
    edges.push(
      new Edge(
        sourceNode.id,
        to_node.id,
        `${percentage !== 100 ? percentage + "% - " : ""}${
          material?.name || "-"
        } `,
      ),
    );
    const nextStep = await expandTransformation(
      sourceTransformation,
      sourceNode,
      supplyChainInfo,
    );
    nodes = nodes.concat(nextStep.nodes);
    edges = edges.concat(nextStep.edges);
  }
  return { nodes: nodes, edges: edges };
};
