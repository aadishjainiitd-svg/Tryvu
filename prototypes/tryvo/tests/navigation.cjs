async function openNavigation(page){
 const button=page.locator('.sidebar-toggle');
 if(await button.isVisible()&&await button.getAttribute('aria-expanded')==='false')await button.click();
}
module.exports={openNavigation};
