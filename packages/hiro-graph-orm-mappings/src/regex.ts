import { mapRelationship } from "./relations";

const mandatoryAttributesRegex = /ogit:mandatory-attributes \(([^);]+)/;
const optionalAttributesRegex = /ogit:optional-attributes \(([^);]+)/;
const relationsRegex = /ogit:allowed \(([^);]+)/;

export function getData(regex: RegExp, input: string): string[] {
    const res = input.match(regex);

    if (!res) {
        console.warn("Regex failed:", regex.source);
        return [];
    }

    return res[1]
        .trim()
        .split("\n")
        .map(v => v.trim())
        .map(v => v.replace(/\./g, "/").replace(/:/g, "/"));
}

function cleanName(name: string) {
    return name.replace(/-/g, "_");
}

function getAttributes(regex: RegExp, input: string) {
    const data = getData(regex, input);
    const output: IDefinitionData = {};

    for (const v of data) {
        const name = v.split("/").pop();
        if (!name) {
            continue;
        }

        output[cleanName(name)] = v;
    }

    return output;
}

export function getRelations(
    input: string,
    ogit: string,
    startValue: IDefinitionData = {},
    addRelation: (v: string[], from: string) => void
) {
    const data = getData(relationsRegex, input);
    const output: IDefinitionData = startValue;

    let i = 0;
    for (const v of data) {
        const newV = v
            .substr(1, v.length - 2)
            .trim()
            .split("  ");

        if (!newV || !newV[0] || !newV[1]) {
            console.log("No relations for " + ogit);
            continue;
        }

        const left = newV[0].split("/").pop() || "";
        const right = newV[1].split("/").pop() || "";

        addRelation(newV, ogit);

        const relationship = newV[0] + " -> " + newV[1];
        const relationshipKey = mapRelationship(
            relationship,
            left + right || i
        );

        const old = output[relationshipKey];
        if (old && old !== relationship) {
            throw new Error(
                `Relationship '${relationshipKey}' already exists. Old: ${old} New: ${relationship}`
            );
        }

        output[relationshipKey] = relationship;
        i += 1;
    }

    return output;
}

export const getRequiredAttributes = (input: string) =>
    getAttributes(mandatoryAttributesRegex, input);
export const getOptionalAttributes = (input: string) =>
    getAttributes(optionalAttributesRegex, input);
