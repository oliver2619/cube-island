import {Color} from "three";

export class Colors {
    static normalize(color: Color): void {
        const max = Math.max(color.r, color.g, color.b);
        if (max > 0)
            color.multiplyScalar(1 / max);
    }
}

export class NaturalColors {
    private static SUN_TEMPERATURE = 5778;

    private static LAMBDA_RED = 700.;
    private static INV_LAMBDA_RED3 = 1 / (NaturalColors.LAMBDA_RED * NaturalColors.LAMBDA_RED * NaturalColors.LAMBDA_RED);
    private static LAMBDA_GREEN = 546.1;
    private static INV_LAMBDA_GREEN3 = 1 / (NaturalColors.LAMBDA_GREEN * NaturalColors.LAMBDA_GREEN * NaturalColors.LAMBDA_GREEN);
    private static LAMBDA_BLUE = 435.8;
    private static INV_LAMBDA_BLUE3 = 1 / (NaturalColors.LAMBDA_BLUE * NaturalColors.LAMBDA_BLUE * NaturalColors.LAMBDA_BLUE);

    private static SKY_RED = Math.pow(NaturalColors.LAMBDA_BLUE / NaturalColors.LAMBDA_RED, 4);//0.150;// 0.607; // 0.384
    private static SKY_GREEN = Math.pow(NaturalColors.LAMBDA_BLUE / NaturalColors.LAMBDA_GREEN, 4);//0.406; //0.637; // 0.644
    private static SKY_BLUE = 1.; // 1

    private static TEMPERATURE_COEFF = 1439e4;

    private static SKY_COLOR = new Color();

    static get sky(): Color {
        const ret = NaturalColors.getNormalizedForTemperature(NaturalColors.SUN_TEMPERATURE);
        ret.r *= NaturalColors.SKY_RED;
        ret.g *= NaturalColors.SKY_GREEN;
        ret.b *= NaturalColors.SKY_BLUE;
        return ret;
    }

    static getForTemperature(temperature: number): Color {
        const ret = new Color();
        const tc = NaturalColors.TEMPERATURE_COEFF / temperature;
        ret.r = Math.sqrt(NaturalColors.INV_LAMBDA_RED3 / (Math.exp(tc / NaturalColors.LAMBDA_RED) - 1));
        ret.g = Math.sqrt(NaturalColors.INV_LAMBDA_GREEN3 / (Math.exp(tc / NaturalColors.LAMBDA_GREEN) - 1));
        ret.b = Math.sqrt(NaturalColors.INV_LAMBDA_BLUE3 / (Math.exp(tc / NaturalColors.LAMBDA_BLUE) - 1));
        return ret;
    }

    static getNormalizedForTemperature(temperature: number): Color {
        const ret = NaturalColors.getForTemperature(temperature);
        Colors.normalize(ret);
        return ret;
    }

    static getSun(dawn: number): Color {
        const ret = NaturalColors.getNormalizedForTemperature(NaturalColors.SUN_TEMPERATURE);
        ret.r = Math.max(ret.r * (1 - NaturalColors.SKY_RED * 2 * dawn), 0);
        ret.g = Math.max(ret.g * (1 - NaturalColors.SKY_GREEN * 2 * dawn), 0);
        ret.b = Math.max(ret.b * (1 - NaturalColors.SKY_BLUE * 2 * dawn), 0);
        return ret;
    }
}

