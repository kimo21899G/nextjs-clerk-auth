import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// 로그인이 꼭 필요한 route 설정법
const isProtectedRoute = createRouteMatcher(["/user-profile"]);
// export default clerkMiddleware(async (auth, req) => {
//   if (isProtectedRoute(req)) await auth.protect();
// });

// 로그인전 접근허용 route 지정방법
const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

// 어드민 허용 route 지정
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { isAuthenticated, redirectToSignIn, sessionClaims } = await auth();

  // console.log(`role=${sessionClaims?.metadata?.role}`);

  // 로그인이 필요한 메뉴
  // if (isProtectedRoute(req)) await auth.protect();
  if (isProtectedRoute(req) && !isAuthenticated) {
    await auth.protect();
    // return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // 관리자 전용메뉴
  if (isAdminRoute(req)) {
    // 1) 로그인 안 했으면 Clerk 로그인으로
    if (!isAuthenticated) return redirectToSignIn();

    // 2) 로그인은 했지만 role이 admin이 아니면 홈으로
    if (sessionClaims?.metadata?.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
      // 또는 403을 주고 싶으면:
      // return new NextResponse("Forbidden", { status: 403 });
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
