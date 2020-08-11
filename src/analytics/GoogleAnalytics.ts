import { Analytics } from "./Analytics";

export class GoogleAnalytics implements Analytics {
    private constructor(private gtag: Gtag.Gtag) {}
    public static create(trackerId: string) {
        const analytics = new GoogleAnalytics(gtag);
        (window as any).dataLayer = (window as any).dataLayer || [];
        (window as any).gtag = function gtag() {
            (window as any).dataLayer.push(arguments);
        }

        analytics.gtag("js", new Date());
        analytics.gtag("config", trackerId);

        const scriptElement = new HTMLScriptElement();
        scriptElement.async = true;
        scriptElement.src = `https://www.googletagmanager.com/gtag/js?id=${trackerId}`;
        document.getElementsByTagName("body")[0].prepend(scriptElement);
        return analytics;
    }
}
