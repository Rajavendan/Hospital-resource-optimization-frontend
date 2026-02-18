import React from "react";

// Since I don't know if radix-ui is installed, I will make a safe native simplified version.
// If the user has radix, they can swap it back, but this ensures it WORKS now.

const Label = React.forwardRef(({ className, ...props }, ref) => (
    <label
        ref={ref}
        className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className || ""}`}
        {...props}
    />
));
Label.displayName = "Label";

export { Label };
