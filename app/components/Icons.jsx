export function CloseIcon({size}) {
    return (
    <div>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 64 64" fill="none" stroke="#000000"><line x1="16" y1="16" x2="48" y2="48"/><line x1="48" y1="16" x2="16" y2="48"/></svg>
    </div>);
} 

export function AddIcon({size}) {
    return (
        <div>
            <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 64 64" fill="none" stroke="#000000"><line x1="32" y1="16" x2="32" y2="48"/><line x1="16" y1="32" x2="48" y2="32"/></svg>
        </div>
    )
}

export function MinusIcon({size}) {
    return (
        <div>
            <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 64 64" fill="none" stroke="#000000"><line x1="16" y1="32" x2="48" y2="32"/></svg>
        </div>
    )
}

export function VanIcon({size}){
    return (
        <div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="#000000" width={size} height={size} viewBox="0 0 256 256" id="Flat">
                <path d="M243.99792,119.98145a3.985,3.985,0,0,0-.071-.70411c-.00965-.05273-.01941-.10449-.03113-.15673a3.97424,3.97424,0,0,0-.18213-.606l-.02686-.06738-.00268-.00684L229.72534,83.543A11.94255,11.94255,0,0,0,218.58374,76h-38.584V64a4.0002,4.0002,0,0,0-4-4h-152a12.01312,12.01312,0,0,0-12,12V184a12.01312,12.01312,0,0,0,12,12H40.29a27.99642,27.99642,0,0,0,55.41943,0H160.29a27.99642,27.99642,0,0,0,55.41943,0h16.29028a12.01343,12.01343,0,0,0,12-12V120ZM218.58374,84a3.98112,3.98112,0,0,1,3.71386,2.51465L234.09155,116h-54.0918V84ZM23.99975,68h148v72h-152V72A4.00427,4.00427,0,0,1,23.99975,68Zm-4,116V148h152v21.0415A28.02663,28.02663,0,0,0,160.29,188H95.70947A27.99642,27.99642,0,0,0,40.29,188H23.99975A4.00427,4.00427,0,0,1,19.99975,184Zm48,28a20,20,0,1,1,20-20A20.02229,20.02229,0,0,1,67.99975,212Zm120,0a20,20,0,1,1,20-20A20.02229,20.02229,0,0,1,187.99975,212Zm48-28a4.00426,4.00426,0,0,1-4,4H215.70947a27.98464,27.98464,0,0,0-35.70972-22.8291V124h56Z"/>
            </svg>
        </div>
    )
}

export function TickIcon({size}){
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 64 64" fill="none" stroke="#000000"><circle cx="32" cy="32" r="24"/><polyline points="44 24 28 40 20 32"/></svg>
    )
}

export function PencilIcon({size}){
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 64 64" fill="none" stroke="#000000"><polygon points="24 52 56 20 44 8 12 40 8 56 24 52"/><line x1="12" y1="40" x2="24" y2="52"/><line x1="36" y1="16" x2="48" y2="28"/></svg>
    )
}

export function FrequencyIcon({size}){
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" fill="none"/>
            <path d="M2.5 12C2.5 12.2761 2.72386 12.5 3 12.5C3.27614 12.5 3.5 12.2761 3.5 12H2.5ZM3.5 12C3.5 7.30558 7.30558 3.5 12 3.5V2.5C6.75329 2.5 2.5 6.75329 2.5 12H3.5ZM12 3.5C15.3367 3.5 18.2252 5.4225 19.6167 8.22252L20.5122 7.77748C18.9583 4.65062 15.7308 2.5 12 2.5V3.5Z" fill="#000000"/>
            <path d="M20.4716 2.42157V8.07843H14.8147" stroke="#000000" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21.5 12C21.5 11.7239 21.2761 11.5 21 11.5C20.7239 11.5 20.5 11.7239 20.5 12L21.5 12ZM20.5 12C20.5 16.6944 16.6944 20.5 12 20.5L12 21.5C17.2467 21.5 21.5 17.2467 21.5 12L20.5 12ZM12 20.5C8.66333 20.5 5.77477 18.5775 4.38328 15.7775L3.48776 16.2225C5.04168 19.3494 8.26923 21.5 12 21.5L12 20.5Z" fill="#000000"/>
            <path d="M3.52844 21.5784L3.52844 15.9216L9.18529 15.9216" stroke="#000000" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )
}

export default function Icons(){
    return "";
}