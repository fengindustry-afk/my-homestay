import { getImageProps } from "next/image";

type Props = {
    desktop: string;
    // Portrait crop for phones, where a full-bleed box is taller than it is wide.
    mobile: string;
    alt: string;
    eager?: boolean;
    className?: string;
};

// Full-bleed photo with art direction. With one landscape file, object-cover
// on a tall phone box stretches a small download 2-3x. The phone gets its own
// portrait crop, sized by the same 100vw hint, so it stays sharp.
export default function CoverPicture({ desktop, mobile, alt, eager = false, className = "object-cover" }: Props) {
    const common = {
        alt,
        fill: true,
        sizes: "100vw",
        quality: 85,
        loading: eager ? ("eager" as const) : ("lazy" as const),
        fetchPriority: eager ? ("high" as const) : undefined,
    };
    const { props: { srcSet: mobileSrcSet } } = getImageProps({ ...common, src: mobile });
    const { props } = getImageProps({ ...common, src: desktop });
    return (
        <picture>
            <source media="(max-width: 768px)" srcSet={mobileSrcSet} />
            <img {...props} alt={alt} className={className} />
        </picture>
    );
}
