import { cn } from "@/lib/utils";

export const AvatarCircles = ({
  numPeople = 0,
  className,
  avatarUrls = [],
}) => {
  return (
    <div className={cn("z-10 flex -space-x-3 rtl:space-x-reverse", className)}>
      {avatarUrls.map((url, index) => {
        const img = (
          <img
            key={index}
            className="h-9 w-9 rounded-full border-2 border-background object-cover bg-muted"
            src={typeof url === "string" ? url : url.imageUrl}
            width={36}
            height={36}
            alt={
              typeof url === "object" && url.alt
                ? url.alt
                : `Avatar ${index + 1}`
            }
          />
        );
        const profileUrl = typeof url === "object" && url.profileUrl;
        if (profileUrl) {
          return (
            <a
              key={index}
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {img}
            </a>
          );
        }
        return <span key={index}>{img}</span>;
      })}
      {numPeople > 0 && (
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-muted text-center text-xs font-medium text-foreground"
          aria-label={`${numPeople} more`}
        >
          +{numPeople}
        </span>
      )}
    </div>
  );
};
